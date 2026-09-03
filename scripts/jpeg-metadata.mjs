const removableMarkers = new Set([0xe1, 0xed, 0xfe]);

const markerName = (marker) => ({
  0xe1: "APP1 (Exif/XMP)",
  0xed: "APP13 (Photoshop/IPTC)",
  0xfe: "COM (comment)",
})[marker] || `0x${marker.toString(16)}`;

export const inspectJpegMetadata = (buffer) => {
  if (!Buffer.isBuffer(buffer) || buffer.length < 4 || buffer[0] !== 0xff || buffer[1] !== 0xd8) {
    throw new Error("not a JPEG file");
  }

  const segments = [];
  let offset = 2;
  while (offset + 1 < buffer.length) {
    if (buffer[offset] !== 0xff) throw new Error(`invalid JPEG marker at byte ${offset}`);
    const markerStart = offset;
    while (offset < buffer.length && buffer[offset] === 0xff) offset += 1;
    if (offset >= buffer.length) break;
    const marker = buffer[offset];

    if (marker === 0xda || marker === 0xd9) break;
    if (marker === 0x00 || marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
      offset += 1;
      continue;
    }
    if (offset + 2 >= buffer.length) throw new Error(`truncated JPEG segment at byte ${markerStart}`);
    const length = buffer.readUInt16BE(offset + 1);
    const segmentEnd = offset + 1 + length;
    if (length < 2 || segmentEnd > buffer.length) throw new Error(`invalid JPEG segment at byte ${markerStart}`);
    if (removableMarkers.has(marker)) {
      segments.push({ marker, name: markerName(marker), bytes: segmentEnd - markerStart });
    }
    offset = segmentEnd;
  }
  return segments;
};

export const stripJpegMetadata = (buffer) => {
  const metadata = inspectJpegMetadata(buffer);
  if (!metadata.length) return { buffer, metadata, removedBytes: 0 };

  const chunks = [buffer.subarray(0, 2)];
  let removedBytes = 0;
  let offset = 2;
  while (offset + 1 < buffer.length) {
    const markerStart = offset;
    while (offset < buffer.length && buffer[offset] === 0xff) offset += 1;
    if (offset >= buffer.length) break;
    const marker = buffer[offset];

    if (marker === 0xda || marker === 0xd9) {
      chunks.push(buffer.subarray(markerStart));
      return { buffer: Buffer.concat(chunks), metadata, removedBytes };
    }
    if (marker === 0x00 || marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
      const segmentEnd = offset + 1;
      chunks.push(buffer.subarray(markerStart, segmentEnd));
      offset = segmentEnd;
      continue;
    }
    const length = buffer.readUInt16BE(offset + 1);
    const segmentEnd = offset + 1 + length;
    if (removableMarkers.has(marker)) {
      removedBytes += segmentEnd - markerStart;
    } else {
      chunks.push(buffer.subarray(markerStart, segmentEnd));
    }
    offset = segmentEnd;
  }
  throw new Error("JPEG scan data is missing");
};

