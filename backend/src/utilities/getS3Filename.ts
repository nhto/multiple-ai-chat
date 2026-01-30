export async function getPhotoS3Filename(
  photoId: string
): Promise<string | undefined> {
  const fileMapping: Record<string, string> = {
    "1": "testing/photos/photo1.jpeg",
    "2": "testing/photos/photo2.jpeg",
    "3": "testing/photos/photo3.jpeg",
    "4": "testing/photos/photo4.jpeg",
    "5": "testing/photos/photo5.jpeg",
    "6": "testing/photos/photo6.jpeg",
    "7": "testing/photos/photo7.jpeg",
    "8": "testing/photos/photo8.jpeg",
    "9": "testing/photos/photo9.jpeg",
    "10": "testing/photos/photo10.jpeg",
    "11": "testing/photos/photo11.jpeg",
    "12": "testing/photos/photo12.jpeg",
  };

  return fileMapping[photoId];
}

export async function getCoverS3Filename(
  coverId: string
): Promise<string | undefined> {
  const fileMapping: Record<string, string> = {
    1: "testing/covers/cover1.jpeg",
    2: "testing/covers/cover2.jpeg",
    3: "testing/covers/cover3.jpeg",
    4: "testing/covers/cover4.jpeg",
    5: "testing/covers/cover5.jpeg",
    6: "testing/covers/cover6.jpeg",
    7: "testing/covers/cover7.jpeg",
    8: "testing/covers/cover8.jpeg",
    9: "testing/covers/cover9.jpeg",
    10: "testing/covers/cover10.jpeg",
    11: "testing/covers/cover11.jpeg",
    12: "testing/covers/cover12.jpeg",
  };

  return fileMapping[coverId];
}
