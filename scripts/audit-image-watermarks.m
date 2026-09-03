#import <Foundation/Foundation.h>
#import <Vision/Vision.h>

static NSString *NormalizeText(NSString *value) {
  NSMutableString *normalized = [NSMutableString string];
  NSCharacterSet *allowed = [NSCharacterSet alphanumericCharacterSet];
  NSString *lowercase = value.lowercaseString;
  for (NSUInteger index = 0; index < lowercase.length; index += 1) {
    unichar character = [lowercase characterAtIndex:index];
    if ([allowed characterIsMember:character]) {
      [normalized appendFormat:@"%C", character];
    }
  }
  return normalized;
}

static BOOL IdentifiesLegacyBrand(NSArray<NSString *> *values) {
  NSString *combined = NormalizeText([values componentsJoinedByString:@" "]);
  BOOL hasFinerName = [combined containsString:@"finerpackaging"] || [combined containsString:@"finerpackag"] || [combined containsString:@"finerpac"];
  BOOL hasAlibabaDomain = [combined containsString:@"enalibabacom"] || [combined containsString:@"alibabacom"];
  BOOL hasWatermarkFragments = ([combined containsString:@"packag"] || [combined containsString:@"ackag"] || [combined containsString:@"deckag"])
    && ([combined containsString:@"baba"] || hasAlibabaDomain);
  return hasFinerName || ([combined containsString:@"finer"] && hasAlibabaDomain) || hasWatermarkFragments;
}

int main(void) {
  @autoreleasepool {
    NSData *inputData = [[NSFileHandle fileHandleWithStandardInput] readDataToEndOfFile];
    NSString *input = [[NSString alloc] initWithData:inputData encoding:NSUTF8StringEncoding] ?: @"";
    NSMutableArray<NSString *> *paths = [NSMutableArray array];
    [input enumerateLinesUsingBlock:^(NSString *line, BOOL *stop) {
      NSString *trimmed = [line stringByTrimmingCharactersInSet:[NSCharacterSet whitespaceAndNewlineCharacterSet]];
      if (trimmed.length > 0) [paths addObject:trimmed];
    }];

    NSMutableArray<NSDictionary *> *matches = [NSMutableArray array];
    NSMutableArray<NSString *> *failures = [NSMutableArray array];
    dispatch_queue_t queue = dispatch_get_global_queue(QOS_CLASS_USER_INITIATED, 0);

    dispatch_apply(paths.count, queue, ^(size_t index) {
      @autoreleasepool {
        NSString *imagePath = paths[index];
        VNRecognizeTextRequest *request = [[VNRecognizeTextRequest alloc] init];
        request.recognitionLevel = VNRequestTextRecognitionLevelAccurate;
        request.recognitionLanguages = @[@"en-US"];
        request.usesLanguageCorrection = NO;
        request.minimumTextHeight = 0.004f;
        request.customWords = @[@"finerpackaging", @"finerpackaging.en.alibaba.com", @"Finer Packaging"];

        NSError *error = nil;
        NSData *imageData = [NSData dataWithContentsOfFile:imagePath options:NSDataReadingMappedIfSafe error:&error];
        if (!imageData) {
          @synchronized (failures) {
            [failures addObject:[NSString stringWithFormat:@"%@: %@", imagePath, error.localizedDescription ?: @"Image read failed"]];
          }
          return;
        }
        VNImageRequestHandler *handler = [[VNImageRequestHandler alloc] initWithData:imageData options:@{}];
        BOOL succeeded = [handler performRequests:@[request] error:&error];
        if (!succeeded || error) {
          @synchronized (failures) {
            [failures addObject:[NSString stringWithFormat:@"%@: %@", imagePath, error.localizedDescription ?: @"OCR failed"]];
          }
          return;
        }

        NSMutableArray<NSString *> *text = [NSMutableArray array];
        NSMutableArray<NSDictionary *> *observations = [NSMutableArray array];
        for (VNRecognizedTextObservation *observation in request.results ?: @[]) {
          VNRecognizedText *candidate = [observation topCandidates:1].firstObject;
          if (candidate.string.length > 0) {
            CGRect box = observation.boundingBox;
            NSString *normalizedCandidate = NormalizeText(candidate.string);
            BOOL isLegacyCandidate = [normalizedCandidate containsString:@"finer"]
              || [normalizedCandidate containsString:@"alibaba"]
              || [normalizedCandidate containsString:@"allbaba"]
              || [normalizedCandidate containsString:@"packagingen"]
              || [normalizedCandidate containsString:@"ackagingen"];
            NSMutableArray<NSDictionary *> *characterBoxes = [NSMutableArray array];
            if (isLegacyCandidate) {
              for (NSUInteger characterIndex = 0; characterIndex < candidate.string.length; characterIndex += 1) {
                NSError *rangeError = nil;
                VNRectangleObservation *characterObservation = [candidate boundingBoxForRange:NSMakeRange(characterIndex, 1) error:&rangeError];
                if (!characterObservation || rangeError) continue;
                CGRect characterBox = characterObservation.boundingBox;
                [characterBoxes addObject:@{
                  @"index": @(characterIndex),
                  @"text": [candidate.string substringWithRange:NSMakeRange(characterIndex, 1)],
                  @"boundingBox": @{
                    @"x": @(characterBox.origin.x),
                    @"y": @(characterBox.origin.y),
                    @"width": @(characterBox.size.width),
                    @"height": @(characterBox.size.height),
                  },
                }];
              }
            }
            [text addObject:candidate.string];
            [observations addObject:@{
              @"text": candidate.string,
              @"confidence": @(candidate.confidence),
              @"characterBoxes": characterBoxes,
              @"boundingBox": @{
                @"x": @(box.origin.x),
                @"y": @(box.origin.y),
                @"width": @(box.size.width),
                @"height": @(box.size.height),
              },
            }];
          }
        }
        if (IdentifiesLegacyBrand(text)) {
          @synchronized (matches) {
            [matches addObject:@{@"path": imagePath, @"text": text, @"observations": observations}];
          }
        }
      }
    });

    NSSortDescriptor *pathOrder = [NSSortDescriptor sortDescriptorWithKey:@"path" ascending:YES];
    [matches sortUsingDescriptors:@[pathOrder]];
    [failures sortUsingSelector:@selector(compare:)];
    NSDictionary *result = @{
      @"scanned": @(paths.count),
      @"matches": matches,
      @"failures": failures,
    };
    NSError *jsonError = nil;
    NSData *json = [NSJSONSerialization dataWithJSONObject:result options:NSJSONWritingPrettyPrinted | NSJSONWritingSortedKeys error:&jsonError];
    if (!json) {
      fprintf(stderr, "%s\n", jsonError.localizedDescription.UTF8String);
      return 1;
    }
    [[NSFileHandle fileHandleWithStandardOutput] writeData:json];
    [[NSFileHandle fileHandleWithStandardOutput] writeData:[@"\n" dataUsingEncoding:NSUTF8StringEncoding]];
  }
  return 0;
}
