export const MAX_VIDEO_SIZE = 500 * 1024 * 1024;
export const MAX_THUMBNAIL_SIZE = 10 * 1024 * 1024;

export const BUNNY = {
  STREAM_BASE_URL: "https://video.bunnycdn.com/library",
  STORAGE_BASE_URL: "https://storage.bunnycdn.com/jsm-snap",
  CDN_URL: "https://jsm-snap.b-cdn.net",
  EMBED_URL: "https://iframe.mediadelivery.net/embed",
  TRANSCRIPT_URL: "https://vz-92e27cf3-973.b-cdn.net",
};

export const emojis = ["😂", "😍", "👍"];

export const filterOptions = [
  "Most Viewed",
  "Most Recent",
  "Oldest First",
  "Least Viewed",
];

export const visibilities: Visibility[] = ["public", "private"];

export const ICONS = {
  record: "/assets/icons/record.svg",
  close: "/assets/icons/close.svg",
  upload: "/assets/icons/upload.svg",
};

export const initialVideoState = {
  isLoaded: false,
  hasIncrementedView: false,
  isProcessing: true,
  processingProgress: 0,
};

export const infos = ["transcript", "metadata"];

export const DEFAULT_VIDEO_CONFIG = {
  width: { ideal: 1920 },
  height: { ideal: 1080 },
  frameRate: { ideal: 30 },
};

export const DEFAULT_RECORDING_CONFIG = {
  mimeType: "video/webm;codecs=vp9,opus",
  audioBitsPerSecond: 128000,
  videoBitsPerSecond: 2500000,
};
export const dummyCards=[
  {
    id: "1",
    title: "SnapShat Message",
    thumbnail: "/assets/samples/thumbnail (1).png",
    createdAt: new Date("2025-05-01"),
    userImg: "/assets/images/jason.png",
    username: "Pallavi",
    views: 10,
    visibility: "public",
    duration: 156,
  }, 
   {
    id: "2",
    title: "React Tutorial",
    thumbnail: "/assets/samples/thumbnail (2).png",
    createdAt: new Date("2025-04-15"),
    userImg: "/assets/images/alex.png",
    username: "Alex",
    views: 120,
    visibility: "public",
    duration: 300,
  },
   {
    id: "3",
    title: "Nature Walk",
    thumbnail: "/assets/samples/thumbnail (3).png",
    createdAt: new Date("2025-03-20"),
    userImg: "/assets/images/david.png",
    username: "Sam",
    views: 45,
    visibility: "private",
    duration: 210,
  },
   {
    id: "4",
    title: "Cooking Pasta",
    thumbnail: "/assets/samples/thumbnail (4).png",
    createdAt: new Date("2025-02-10"),
    userImg: "/assets/images/lisa.png",
    username: "Lisa",
    views: 78,
    visibility: "public",
    duration: 180,
  },
   {
    id: "5",
    title: "Travel Vlog",
    thumbnail: "/assets/samples/thumbnail (5).png",
    createdAt: new Date("2025-01-25"),
    userImg: "/assets/images/emily.png",
    username: "Mark",
    views: 200,
    visibility: "public",
    duration: 420,
  },
  {
    id: "6",
    title: "Guitar Cover",
    thumbnail: "/assets/samples/thumbnail (6).png",
    createdAt: new Date("2025-05-10"),
    userImg: "/assets/images/anna.png",
    username: "Anna",
    views: 60,
    visibility: "private",
    duration: 240,
  },
   {
    id: "7",
    title: "Tech News",
    thumbnail: "/assets/samples/thumbnail (7).png",
    createdAt: new Date("2025-04-05"),
    userImg: "/assets/images/jessica.png",
    username: "John",
    views: 150,
    visibility: "public",
    duration: 360,
  },
  {
    id: "8",
    title: "Fitness Routine",
    thumbnail: "/assets/samples/thumbnail (8).png",
    createdAt: new Date("2025-03-30"),
    userImg: "/assets/images/sarah.png",
    username: "Emma",
    views: 95,
    visibility: "public",
    duration: 275,
  },
]