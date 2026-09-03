#import <Foundation/Foundation.h>
#import <Vision/Vision.h>

static NSArray<NSString *> *RecognizedText(NSURL *imageURL) {
    @autoreleasepool {
        VNRecognizeTextRequest *request = [[VNRecognizeTextRequest alloc] init];
        request.recognitionLevel = VNRequestTextRecognitionLevelFast;
        request.usesLanguageCorrection = NO;
        request.minimumTextHeight = 0.035;
        VNImageRequestHandler *handler = [[VNImageRequestHandler alloc] initWithURL:imageURL options:@{}];
        NSError *error = nil;
        if (![handler performRequests:@[request] error:&error]) return @[@"[image-read-error]"];

        NSMutableArray<NSString *> *texts = [NSMutableArray array];
        for (VNRecognizedTextObservation *observation in request.results ?: @[]) {
            VNRecognizedText *candidate = [[observation topCandidates:1] firstObject];
            NSString *text = [candidate.string stringByTrimmingCharactersInSet:NSCharacterSet.whitespaceAndNewlineCharacterSet];
            if (text.length > 0) [texts addObject:text];
        }
        return texts;
    }
}

int main(int argc, const char *argv[]) {
    @autoreleasepool {
        if (argc != 3) {
            fprintf(stderr, "Usage: select-authorized-catalog-images <images-directory> <output-json>\n");
            return 64;
        }

        NSFileManager *fileManager = NSFileManager.defaultManager;
        NSString *imageRoot = [NSString stringWithUTF8String:argv[1]];
        NSString *outputPath = [NSString stringWithUTF8String:argv[2]];
        NSSet<NSString *> *allowedExtensions = [NSSet setWithArray:@[@"jpg", @"jpeg", @"png", @"webp"]];
        NSError *error = nil;
        NSArray<NSString *> *directoryNames = [[fileManager contentsOfDirectoryAtPath:imageRoot error:&error]
            sortedArrayUsingSelector:@selector(localizedStandardCompare:)];
        if (!directoryNames) {
            fprintf(stderr, "%s\n", error.localizedDescription.UTF8String);
            return 1;
        }

        NSMutableArray<NSDictionary *> *choices = [NSMutableArray arrayWithCapacity:directoryNames.count];
        NSUInteger processed = 0;
        for (NSString *directoryName in directoryNames) {
            NSString *directoryPath = [imageRoot stringByAppendingPathComponent:directoryName];
            BOOL isDirectory = NO;
            if (![fileManager fileExistsAtPath:directoryPath isDirectory:&isDirectory] || !isDirectory) continue;

            NSArray<NSString *> *candidateNames = [[[fileManager contentsOfDirectoryAtPath:directoryPath error:nil] ?: @[]
                filteredArrayUsingPredicate:[NSPredicate predicateWithBlock:^BOOL(NSString *name, NSDictionary *bindings) {
                    return [allowedExtensions containsObject:name.pathExtension.lowercaseString];
                }]] sortedArrayUsingSelector:@selector(localizedStandardCompare:)];

            // The source downloader prefixes gallery images with their original position.
            // Always keep 01 as the product image: choosing a later image by OCR score can
            // accidentally select a shared process graphic that does not depict the product.
            NSString *primaryName = [candidateNames firstObject];
            if (primaryName) {
                NSString *primaryRelativePath = [directoryName stringByAppendingPathComponent:primaryName];
                NSURL *primaryURL = [NSURL fileURLWithPath:[imageRoot stringByAppendingPathComponent:primaryRelativePath]];
                NSArray<NSString *> *primaryText = RecognizedText(primaryURL);
                [choices addObject:@{
                    @"id": directoryName,
                    @"relativePath": primaryRelativePath,
                    @"sourceImagePosition": @1,
                    @"detectedText": primaryText ?: @[],
                }];
            }

            processed += 1;
            if (processed % 100 == 0 || processed == directoryNames.count) {
                fprintf(stderr, "Scanned %lu/%lu product folders\n", (unsigned long)processed, (unsigned long)directoryNames.count);
            }
        }

        NSData *jsonData = [NSJSONSerialization dataWithJSONObject:choices options:NSJSONWritingPrettyPrinted error:&error];
        if (!jsonData) {
            fprintf(stderr, "%s\n", error.localizedDescription.UTF8String);
            return 1;
        }
        NSString *outputDirectory = outputPath.stringByDeletingLastPathComponent;
        [fileManager createDirectoryAtPath:outputDirectory withIntermediateDirectories:YES attributes:nil error:&error];
        if (![jsonData writeToFile:outputPath options:NSDataWritingAtomic error:&error]) {
            fprintf(stderr, "%s\n", error.localizedDescription.UTF8String);
            return 1;
        }

        NSUInteger cleanCount = 0;
        for (NSDictionary *choice in choices) if ([choice[@"detectedText"] count] == 0) cleanCount += 1;
        fprintf(stderr, "Selected %lu matching source primary images; %lu have no OCR-detected text\n", (unsigned long)choices.count, (unsigned long)cleanCount);
        return 0;
    }
}
