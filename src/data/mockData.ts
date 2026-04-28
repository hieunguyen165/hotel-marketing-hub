export type AccountCategory = "Website" | "Fanpage" | "Quảng cáo" | "OTA" | "Email" | "Thiết kế";
export type Importance = "Nguy hiểm" | "Quan trọng" | "Thường";

export interface MarketingAccount {
  id: string;
  name: string;
  category: AccountCategory;
  importance: Importance;
  owner: string;
  description: string;
  handoverNote: string;
  lastUpdated: string;
  loginUrl?: string;
  username?: string;
  password?: string;
  guide?: string;
}

export const accounts: MarketingAccount[] = [
  {
    id: "a1",
    name: "Website dlioro-hotel.com (Hosting + Domain)",
    category: "Website",
    importance: "Nguy hiểm",
    owner: "Anh Khoa (IT)",
    description: "Tài khoản quản trị tên miền và hosting chính. Mất tài khoản này = mất website.",
    handoverNote: "Chuyển quyền sở hữu domain qua Cloudflare. Cập nhật email khôi phục về email công ty.",
    lastUpdated: "2026-04-12",
    loginUrl: "https://dash.cloudflare.com",
    username: "admin@dlioro-hotel.com",
    password: "Dlioro@2026#hosting",
    guide: "Đăng nhập Cloudflare → chọn domain dlioro-hotel.com → quản lý DNS, SSL. Hosting truy cập qua cPanel link riêng.",
  },
  {
    id: "a2",
    name: "Fanpage Facebook D'lioro Hotel",
    category: "Fanpage",
    importance: "Nguy hiểm",
    owner: "Chị Linh (Marketing)",
    description: "Fanpage chính 28K follow. Tài sản truyền thông quan trọng nhất.",
    handoverNote: "Thêm người mới vào Business Manager với vai trò Admin trước khi gỡ người cũ.",
    lastUpdated: "2026-04-20",
    loginUrl: "https://business.facebook.com",
    username: "marketing@dlioro-hotel.com",
    password: "Dlioro@FB2026",
    guide: "Vào Business Manager → Pages → D'lioro Hotel. Mọi thao tác qua BM, không dùng tài khoản cá nhân.",
  },
  {
    id: "a3",
    name: "Meta Ads Business Manager",
    category: "Quảng cáo",
    importance: "Nguy hiểm",
    owner: "Chị Linh (Marketing)",
    description: "Tài khoản chạy quảng cáo Facebook/Instagram. Liên kết thẻ thanh toán công ty.",
    handoverNote: "Bàn giao quyền Admin BM. Kiểm tra hạn mức chi tiêu và phương thức thanh toán.",
    lastUpdated: "2026-04-22",
    loginUrl: "https://adsmanager.facebook.com",
    username: "ads@dlioro-hotel.com",
    password: "DlioroAds#2026",
    guide: "Ads Manager → Account: D'lioro Hotel Ads. Kiểm tra Billing trước khi launch campaign mới.",
  },
  {
    id: "a4",
    name: "Google Ads",
    category: "Quảng cáo",
    importance: "Quan trọng",
    owner: "Chị Linh (Marketing)",
    description: "Chạy Search & Performance Max cho từ khóa khách sạn Đà Lạt.",
    handoverNote: "Mời email mới với quyền Standard, sau đó nâng Admin.",
    lastUpdated: "2026-04-15",
    loginUrl: "https://ads.google.com",
    username: "marketing@dlioro-hotel.com",
    password: "DlioroGads@2026",
    guide: "Customer ID: 123-456-7890. Chỉ dừng campaign, không xóa lịch sử.",
  },
  {
    id: "a5",
    name: "Booking.com Extranet",
    category: "OTA",
    importance: "Nguy hiểm",
    owner: "Anh Tùng (Sales)",
    description: "Quản lý phòng, giá, lịch trên Booking.com.",
    handoverNote: "Yêu cầu Booking đổi email liên hệ chính. Cập nhật 2FA về số điện thoại lễ tân.",
    lastUpdated: "2026-04-18",
    loginUrl: "https://admin.booking.com",
    username: "dlioro_hotel",
    password: "Booking@Dlioro2026",
    guide: "Cập nhật giá & inventory hàng ngày. 2FA gửi về SĐT lễ tân 0263xxx.",
  },
  {
    id: "a6",
    name: "Agoda YCS",
    category: "OTA",
    importance: "Quan trọng",
    owner: "Anh Tùng (Sales)",
    description: "Hệ thống quản lý kênh Agoda.",
    handoverNote: "Tạo sub-account riêng cho nhân sự mới.",
    lastUpdated: "2026-04-10",
    loginUrl: "https://ycs.agoda.com",
    username: "dlioro.hotel",
    password: "Agoda@2026",
    guide: "Mỗi nhân sự phải có sub-account riêng, không dùng chung.",
  },
  {
    id: "a7",
    name: "Email marketing@dlioro-hotel.com",
    category: "Email",
    importance: "Quan trọng",
    owner: "Chị Linh (Marketing)",
    description: "Email dùng để đăng ký mọi tài khoản marketing.",
    handoverNote: "Đổi mật khẩu, cập nhật số điện thoại khôi phục về số công ty.",
    lastUpdated: "2026-04-25",
    loginUrl: "https://mail.google.com",
    username: "marketing@dlioro-hotel.com",
    password: "DlioroMail@2026",
    guide: "Email gốc dùng để khôi phục mọi tài khoản marketing — không bao giờ xóa.",
  },
  {
    id: "a8",
    name: "Canva Team D'lioro",
    category: "Thiết kế",
    importance: "Thường",
    owner: "Bạn Nhi (Design)",
    description: "Workspace chứa toàn bộ template thương hiệu.",
    handoverNote: "Mời thành viên mới qua email, gán quyền Brand Designer.",
    lastUpdated: "2026-04-08",
    loginUrl: "https://canva.com",
    username: "design@dlioro-hotel.com",
    password: "Canva@Dlioro2026",
    guide: "Workspace 'D\\'lioro Brand'. Tất cả file phải đặt trong folder thương hiệu.",
  },
];

export interface Resource {
  id: string;
  name: string;
  type: "Hình ảnh" | "Video" | "Bài viết" | "Thiết kế" | "Brand";
  description: string;
  link: string;
  updatedAt: string;
  owner: string;
}

export const resources: Resource[] = [
  { id: "r1", name: "Bộ ảnh phòng Deluxe 2026", type: "Hình ảnh", description: "120 ảnh chụp mới, đã chỉnh màu, dùng cho website & OTA.", link: "drive.google.com/...", updatedAt: "2026-04-20", owner: "Bạn Nhi" },
  { id: "r2", name: "Video flycam khách sạn 4K", type: "Video", description: "Video 60s và 15s cho quảng cáo Meta.", link: "drive.google.com/...", updatedAt: "2026-03-30", owner: "Anh Khoa" },
  { id: "r3", name: "Kho 50 bài viết Fanpage", type: "Bài viết", description: "Bài đã viết sẵn theo chủ đề: phòng, ẩm thực, trải nghiệm.", link: "notion.so/...", updatedAt: "2026-04-22", owner: "Chị Linh" },
  { id: "r4", name: "Template Canva — Khuyến mãi", type: "Thiết kế", description: "12 template post, story, banner đồng bộ thương hiệu.", link: "canva.com/...", updatedAt: "2026-04-15", owner: "Bạn Nhi" },
  { id: "r5", name: "Brand Guideline D'lioro", type: "Brand", description: "Logo, màu, font, cách sử dụng. File gốc và PDF.", link: "drive.google.com/...", updatedAt: "2026-02-10", owner: "Bạn Nhi" },
  { id: "r6", name: "Ảnh ẩm thực nhà hàng", type: "Hình ảnh", description: "80 ảnh món ăn, không gian nhà hàng buổi tối.", link: "drive.google.com/...", updatedAt: "2026-04-05", owner: "Bạn Nhi" },
];

export interface WeeklyReport {
  week: string; // ISO week label
  website: { sessions: number; bookings: number; conversion: number };
  fanpage: { reach: number; followers: number; engagement: number };
  ads: { spend: number; bookings: number; cpa: number };
}

export const weeklyReports: WeeklyReport[] = [
  { week: "T13", website: { sessions: 3200, bookings: 28, conversion: 0.87 }, fanpage: { reach: 42000, followers: 27800, engagement: 1850 }, ads: { spend: 12000000, bookings: 18, cpa: 666000 } },
  { week: "T14", website: { sessions: 3680, bookings: 34, conversion: 0.92 }, fanpage: { reach: 51000, followers: 27950, engagement: 2210 }, ads: { spend: 13500000, bookings: 22, cpa: 613000 } },
  { week: "T15", website: { sessions: 4100, bookings: 41, conversion: 1.0 }, fanpage: { reach: 58000, followers: 28120, engagement: 2480 }, ads: { spend: 14200000, bookings: 26, cpa: 546000 } },
  { week: "T16", website: { sessions: 4520, bookings: 47, conversion: 1.04 }, fanpage: { reach: 63500, followers: 28310, engagement: 2720 }, ads: { spend: 15000000, bookings: 31, cpa: 483000 } },
  { week: "T17", website: { sessions: 4980, bookings: 53, conversion: 1.06 }, fanpage: { reach: 71000, followers: 28540, engagement: 3120 }, ads: { spend: 15800000, bookings: 36, cpa: 438000 } },
];

export interface ChecklistItem {
  id: string;
  title: string;
  area: "Website" | "Fanpage" | "Quảng cáo" | "OTA" | "Nội dung";
  frequency: "Hàng ngày" | "Hàng tuần" | "Hàng tháng";
  owner: string;
  done: boolean;
}

export const checklist: ChecklistItem[] = [
  { id: "c1", title: "Đăng tối thiểu 4 bài Fanpage", area: "Fanpage", frequency: "Hàng tuần", owner: "Chị Linh", done: true },
  { id: "c2", title: "Trả lời 100% inbox & comment", area: "Fanpage", frequency: "Hàng ngày", owner: "Chị Linh", done: true },
  { id: "c3", title: "Kiểm tra hiệu suất quảng cáo Meta", area: "Quảng cáo", frequency: "Hàng tuần", owner: "Chị Linh", done: false },
  { id: "c4", title: "Cập nhật giá phòng trên 4 OTA", area: "OTA", frequency: "Hàng tuần", owner: "Anh Tùng", done: true },
  { id: "c5", title: "Backup website + database", area: "Website", frequency: "Hàng tuần", owner: "Anh Khoa", done: false },
  { id: "c6", title: "Tổng hợp báo cáo marketing tuần", area: "Nội dung", frequency: "Hàng tuần", owner: "Chị Linh", done: false },
  { id: "c7", title: "Lên kế hoạch nội dung tháng sau", area: "Nội dung", frequency: "Hàng tháng", owner: "Chị Linh", done: false },
  { id: "c8", title: "Kiểm tra review trên Google & Booking", area: "OTA", frequency: "Hàng tuần", owner: "Anh Tùng", done: true },
];
