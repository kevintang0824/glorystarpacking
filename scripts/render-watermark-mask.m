#import <Cocoa/Cocoa.h>

int main(int argc, const char *argv[]) {
  @autoreleasepool {
    if (argc != 8) {
      fprintf(stderr, "usage: render-watermark-mask width height x top fontSize text output\n");
      return 2;
    }
    NSInteger width = atoi(argv[1]);
    NSInteger height = atoi(argv[2]);
    CGFloat x = atof(argv[3]);
    CGFloat top = atof(argv[4]);
    CGFloat fontSize = atof(argv[5]);
    NSString *text = [NSString stringWithUTF8String:argv[6]];
    NSString *outputPath = [NSString stringWithUTF8String:argv[7]];

    NSBitmapImageRep *bitmap = [[NSBitmapImageRep alloc]
      initWithBitmapDataPlanes:NULL
      pixelsWide:width
      pixelsHigh:height
      bitsPerSample:8
      samplesPerPixel:4
      hasAlpha:YES
      isPlanar:NO
      colorSpaceName:NSCalibratedRGBColorSpace
      bitmapFormat:0
      bytesPerRow:0
      bitsPerPixel:0];
    if (!bitmap) return 1;

    NSGraphicsContext *context = [NSGraphicsContext graphicsContextWithBitmapImageRep:bitmap];
    [NSGraphicsContext saveGraphicsState];
    [NSGraphicsContext setCurrentContext:context];
    [[NSColor blackColor] setFill];
    NSRectFill(NSMakeRect(0, 0, width, height));

    NSFont *font = [NSFont fontWithName:@"Helvetica Neue" size:fontSize]
      ?: [NSFont systemFontOfSize:fontSize weight:NSFontWeightRegular];
    NSDictionary *attributes = @{
      NSFontAttributeName: font,
      NSForegroundColorAttributeName: NSColor.whiteColor,
    };
    CGFloat drawY = height - top - font.ascender - fabs(font.descender);
    for (NSInteger offsetY = -2; offsetY <= 2; offsetY += 1) {
      for (NSInteger offsetX = -2; offsetX <= 2; offsetX += 1) {
        [text drawAtPoint:NSMakePoint(x + offsetX, drawY + offsetY) withAttributes:attributes];
      }
    }
    [context flushGraphics];
    [NSGraphicsContext restoreGraphicsState];

    NSData *png = [bitmap representationUsingType:NSBitmapImageFileTypePNG properties:@{}];
    if (!png || ![png writeToFile:outputPath atomically:YES]) return 1;
  }
  return 0;
}
