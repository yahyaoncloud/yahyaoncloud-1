import React, { forwardRef } from "react";
import { HugeiconsIcon, type HugeiconsProps, type IconSvgElement } from "@hugeicons/react";
import * as Core from "@hugeicons/core-free-icons";

export type { IconSvgElement };

export interface HugeIconProps extends Omit<HugeiconsProps, "icon" | "strokeWidth"> {
  size?: number | string;
  className?: string;
  strokeWidth?: number | string;
  color?: string;
}

export type IconType = React.ForwardRefExoticComponent<HugeIconProps & React.RefAttributes<SVGSVGElement>>;
export type LucideIcon = IconType;

export function createHugeIcon(icon: IconSvgElement, displayName?: string): IconType {
  const Component = forwardRef<SVGSVGElement, HugeIconProps>(({ strokeWidth, ...props }, ref) => {
    const sw = typeof strokeWidth === "string" ? parseFloat(strokeWidth) || undefined : strokeWidth;
    return <HugeiconsIcon ref={ref} icon={icon} strokeWidth={sw} {...props} />;
  });
  if (displayName) Component.displayName = displayName;
  return Component;
}

export { HugeiconsIcon };
export type { HugeiconsProps };

// ---------------------------------------------------------------------------
// Hugeicons Mapping
// ---------------------------------------------------------------------------

export const Activity = createHugeIcon(Core.Activity01Icon, "Activity");
export const LuActivity = Activity;

export const ArrowDown = createHugeIcon(Core.ArrowDown01Icon, "ArrowDown");
export const LuArrowDown = ArrowDown;

export const ArrowLeft = createHugeIcon(Core.ArrowLeft01Icon, "ArrowLeft");
export const LuArrowLeft = ArrowLeft;

export const ArrowRight = createHugeIcon(Core.ArrowRight01Icon, "ArrowRight");
export const LuArrowRight = ArrowRight;

export const ArrowUp = createHugeIcon(Core.ArrowUp01Icon, "ArrowUp");
export const LuArrowUp = ArrowUp;

export const ArrowUpDown = createHugeIcon(Core.Sorting05Icon, "ArrowUpDown");
export const LuArrowUpDown = ArrowUpDown;

export const ArrowUpRight = createHugeIcon(Core.ArrowUpRight01Icon, "ArrowUpRight");
export const LuArrowUpRight = ArrowUpRight;

export const Award = createHugeIcon(Core.Award01Icon, "Award");
export const LuAward = Award;

export const Bold = createHugeIcon(Core.TextBoldIcon, "Bold");
export const LuBold = Bold;

export const BookOpen = createHugeIcon(Core.BookOpen01Icon, "BookOpen");
export const LuBookOpen = BookOpen;

export const Briefcase = createHugeIcon(Core.Briefcase01Icon, "Briefcase");
export const LuBriefcase = Briefcase;

export const Calendar = createHugeIcon(Core.Calendar01Icon, "Calendar");
export const LuCalendar = Calendar;

export const Camera = createHugeIcon(Core.Camera01Icon, "Camera");
export const LuCamera = Camera;

export const ChartBar = createHugeIcon(Core.ChartBarLineIcon, "ChartBar");
export const BarChart3 = ChartBar;
export const LuChartBar = ChartBar;

export const Check = createHugeIcon(Core.CheckmarkBadge01Icon, "Check");
export const LuCheck = Check;

export const CheckCircle = createHugeIcon(Core.CheckmarkCircle01Icon, "CheckCircle");
export const CheckCircle2 = CheckCircle;
export const LuCircleCheck = CheckCircle;
export const LuCheckCircle = CheckCircle;

export const ChevronDown = createHugeIcon(Core.ChevronDownIcon, "ChevronDown");
export const LuChevronDown = ChevronDown;

export const ChevronLeft = createHugeIcon(Core.ChevronLeftIcon, "ChevronLeft");
export const LuChevronLeft = ChevronLeft;

export const ChevronRight = createHugeIcon(Core.ChevronRightIcon, "ChevronRight");
export const LuChevronRight = ChevronRight;

export const ChevronUp = createHugeIcon(Core.ChevronUpIcon, "ChevronUp");
export const LuChevronUp = ChevronUp;

export const ChevronsLeft = createHugeIcon(Core.ChevronsLeftIcon, "ChevronsLeft");
export const LuChevronsLeft = ChevronsLeft;

export const ChevronsRight = createHugeIcon(Core.ChevronsRightIcon, "ChevronsRight");
export const LuChevronsRight = ChevronsRight;

export const Circle = createHugeIcon(Core.CircleIcon, "Circle");
export const LuCircle = Circle;

export const CircleAlert = createHugeIcon(Core.AlertCircleIcon, "CircleAlert");
export const AlertCircle = CircleAlert;
export const LuCircleAlert = CircleAlert;

export const CirclePlus = createHugeIcon(Core.PlusSignCircleIcon, "CirclePlus");
export const PlusCircle = CirclePlus;
export const LuCirclePlus = CirclePlus;

export const Clock = createHugeIcon(Core.Clock01Icon, "Clock");
export const LuClock = Clock;

export const Cloud = createHugeIcon(Core.CloudIcon, "Cloud");
export const LuCloud = Cloud;

export const Code = createHugeIcon(Core.CodeIcon, "Code");
export const LuCode = Code;

export const Copy = createHugeIcon(Core.Copy01Icon, "Copy");
export const LuCopy = Copy;

export const CornerDownLeft = createHugeIcon(Core.CornerDownLeftIcon, "CornerDownLeft");
export const LuCornerDownLeft = CornerDownLeft;

export const Cpu = createHugeIcon(Core.CpuIcon, "Cpu");
export const LuCpu = Cpu;

export const Database = createHugeIcon(Core.Database01Icon, "Database");
export const LuDatabase = Database;

export const Discord = createHugeIcon(Core.DiscordIcon, "Discord");
export const FaDiscord = Discord;

export const Download = createHugeIcon(Core.Download01Icon, "Download");
export const LuDownload = Download;

export const EllipsisVertical = createHugeIcon(Core.MoreVerticalIcon, "EllipsisVertical");
export const MoreVertical = EllipsisVertical;
export const LuEllipsisVertical = EllipsisVertical;

export const ExternalLink = createHugeIcon(Core.LinkSquare01Icon, "ExternalLink");
export const LuExternalLink = ExternalLink;

export const Eye = createHugeIcon(Core.EyeIcon, "Eye");
export const LuEye = Eye;

export const EyeOff = createHugeIcon(Core.ViewOffIcon, "EyeOff");
export const LuEyeOff = EyeOff;

export const File = createHugeIcon(Core.File01Icon, "File");
export const LuFile = File;

export const FileAudio = createHugeIcon(Core.FileAudioIcon, "FileAudio");
export const LuFileAudio = FileAudio;

export const FileCode = createHugeIcon(Core.FileCodeIcon, "FileCode");
export const LuFileCode = FileCode;

export const FileJson = createHugeIcon(Core.FileCodeIcon, "FileJson");
export const LuFileJson = FileJson;

export const FileText = createHugeIcon(Core.FileTextIcon, "FileText");
export const LuFileText = FileText;

export const FileVideo = createHugeIcon(Core.Video01Icon, "FileVideo");
export const LuFileVideo = FileVideo;

export const Filter = createHugeIcon(Core.FilterIcon, "Filter");
export const LuFilter = Filter;

export const Github = createHugeIcon(Core.Github01Icon, "Github");
export const LuGithub = Github;
export const FaGithub = Github;

export const Google = createHugeIcon(Core.GoogleIcon, "Google");
export const FaGoogle = Google;

export const Globe = createHugeIcon(Core.Globe02Icon, "Globe");
export const LuGlobe = Globe;

export const Heading1 = createHugeIcon(Core.Heading01Icon, "Heading1");
export const LuHeading1 = Heading1;

export const Heading2 = createHugeIcon(Core.Heading02Icon, "Heading2");
export const LuHeading2 = Heading2;

export const Heading3 = createHugeIcon(Core.Heading03Icon, "Heading3");
export const LuHeading3 = Heading3;

export const Home = createHugeIcon(Core.Home01Icon, "Home");
export const LuHouse = Home;

export const Image = createHugeIcon(Core.Image01Icon, "Image");
export const ImageIcon = Image;
export const LuImage = Image;

export const Inbox = createHugeIcon(Core.InboxIcon, "Inbox");
export const LuInbox = Inbox;

export const Instagram = createHugeIcon(Core.InstagramIcon, "Instagram");
export const LuInstagram = Instagram;

export const Italic = createHugeIcon(Core.TextItalicIcon, "Italic");
export const LuItalic = Italic;

export const KeyRound = createHugeIcon(Core.Key01Icon, "KeyRound");
export const LuKeyRound = KeyRound;

export const Layers = createHugeIcon(Core.Layers01Icon, "Layers");
export const LuLayers = Layers;

export const Layout = createHugeIcon(Core.DashboardSquare01Icon, "Layout");
export const LayoutDashboard = Layout;
export const LuLayoutDashboard = Layout;
export const LuLayout = Layout;

export const LayoutGrid = createHugeIcon(Core.LayoutGridIcon, "LayoutGrid");
export const LuLayoutGrid = LayoutGrid;

export const Link = createHugeIcon(Core.Link01Icon, "Link");
export const LinkIcon = Link;
export const LuLink = Link;

export const Linkedin = createHugeIcon(Core.Linkedin01Icon, "Linkedin");
export const LuLinkedin = Linkedin;

export const List = createHugeIcon(Core.LeftToRightListBulletIcon, "List");
export const LuList = List;

export const ListOrdered = createHugeIcon(Core.LeftToRightListNumberIcon, "ListOrdered");
export const LuListOrdered = ListOrdered;

export const LoaderCircle = createHugeIcon(Core.Loading01Icon, "LoaderCircle");
export const Loader2 = LoaderCircle;
export const LuLoaderCircle = LoaderCircle;

export const Lock = createHugeIcon(Core.LockIcon, "Lock");
export const LuLock = Lock;

export const LogOut = createHugeIcon(Core.Logout01Icon, "LogOut");
export const LuLogOut = LogOut;

export const Mail = createHugeIcon(Core.Mail01Icon, "Mail");
export const LuMail = Mail;

export const Maximize2 = createHugeIcon(Core.FullScreenIcon, "Maximize2");
export const LuMaximize2 = Maximize2;

export const Menu = createHugeIcon(Core.Menu01Icon, "Menu");
export const LuMenu = Menu;

export const MessageSquare = createHugeIcon(Core.Comment01Icon, "MessageSquare");
export const LuMessageSquare = MessageSquare;

export const Minimize2 = createHugeIcon(Core.MinimizeScreenIcon, "Minimize2");
export const LuMinimize2 = Minimize2;

export const Monitor = createHugeIcon(Core.ComputerIcon, "Monitor");
export const LuMonitor = Monitor;

export const Moon = createHugeIcon(Core.Moon01Icon, "Moon");
export const LuMoon = Moon;

export const Move = createHugeIcon(Core.MoveIcon, "Move");
export const LuMove = Move;

export const Network = createHugeIcon(Core.NetworkIcon, "Network");
export const LuNetwork = Network;

export const Newspaper = createHugeIcon(Core.NewspaperIcon, "Newspaper");
export const LuNewspaper = Newspaper;

export const Palette = createHugeIcon(Core.PaintBoardIcon, "Palette");
export const LuPalette = Palette;

export const PanelLeft = createHugeIcon(Core.SidebarLeftIcon, "PanelLeft");
export const LuPanelLeft = PanelLeft;

export const Pencil = createHugeIcon(Core.PencilEdit01Icon, "Pencil");
export const Edit = Pencil;
export const Edit2 = Pencil;
export const LuPencil = Pencil;

export const Plus = createHugeIcon(Core.PlusSignIcon, "Plus");
export const LuPlus = Plus;

export const QrCode = createHugeIcon(Core.QrCodeIcon, "QrCode");
export const LuQrCode = QrCode;

export const Quote = createHugeIcon(Core.QuoteDownIcon, "Quote");
export const LuQuote = Quote;

export const RefreshCw = createHugeIcon(Core.RefreshIcon, "RefreshCw");
export const LuRefreshCw = RefreshCw;

export const RotateCcw = createHugeIcon(Core.RotateLeft01Icon, "RotateCcw");
export const LuRotateCcw = RotateCcw;

export const Save = createHugeIcon(Core.FloppyDiskIcon, "Save");
export const LuSave = Save;

export const Search = createHugeIcon(Core.Search01Icon, "Search");
export const LuSearch = Search;

export const Send = createHugeIcon(Core.SentIcon, "Send");
export const LuSend = Send;

export const Server = createHugeIcon(Core.ServerIcon, "Server");
export const LuServer = Server;

export const Settings = createHugeIcon(Core.Settings01Icon, "Settings");
export const LuSettings = Settings;

export const Share2 = createHugeIcon(Core.Share01Icon, "Share2");
export const LuShare2 = Share2;

export const Shield = createHugeIcon(Core.Shield01Icon, "Shield");
export const LuShield = Shield;

export const ShieldCheck = createHugeIcon(Core.ShieldCheckIcon, "ShieldCheck");
export const LuShieldCheck = ShieldCheck;

export const Smartphone = createHugeIcon(Core.SmartPhone01Icon, "Smartphone");
export const LuSmartphone = Smartphone;

export const Sparkles = createHugeIcon(Core.SparklesIcon, "Sparkles");
export const LuSparkles = Sparkles;

export const Star = createHugeIcon(Core.StarIcon, "Star");
export const LuStar = Star;

export const Sun = createHugeIcon(Core.Sun01Icon, "Sun");
export const LuSun = Sun;

export const Tablet = createHugeIcon(Core.Tablet01Icon, "Tablet");
export const LuTablet = Tablet;

export const Tag = createHugeIcon(Core.Tag01Icon, "Tag");
export const LuTag = Tag;

export const Tags = createHugeIcon(Core.Tag01Icon, "Tags");
export const LuTags = Tags;

export const Terminal = createHugeIcon(Core.TerminalIcon, "Terminal");
export const LuTerminal = Terminal;

export const Trash2 = createHugeIcon(Core.Delete02Icon, "Trash2");
export const LuTrash2 = Trash2;

export const TrendingUp = createHugeIcon(Core.TrendingUpIcon, "TrendingUp");
export const LuTrendingUp = TrendingUp;

export const TriangleAlert = createHugeIcon(Core.TriangleAlertIcon, "TriangleAlert");
export const AlertTriangle = TriangleAlert;
export const LuTriangleAlert = TriangleAlert;

export const Twitter = createHugeIcon(Core.TwitterIcon, "Twitter");
export const LuTwitter = Twitter;

export const SquareXTwitter = createHugeIcon(Core.NewTwitterRectangleIcon, "SquareXTwitter");
export const FaSquareXTwitter = SquareXTwitter;

export const Upload = createHugeIcon(Core.Upload01Icon, "Upload");
export const LuUpload = Upload;

export const User = createHugeIcon(Core.UserIcon, "User");
export const LuUser = User;

export const Users = createHugeIcon(Core.UserGroupIcon, "Users");
export const LuUsers = Users;

export const Workflow = createHugeIcon(Core.WorkflowSquare01Icon, "Workflow");
export const LuWorkflow = Workflow;

export const X = createHugeIcon(Core.Cancel01Icon, "X");
export const LuX = X;

export const ZoomIn = createHugeIcon(Core.ZoomInIcon, "ZoomIn");
export const LuZoomIn = ZoomIn;

export const ZoomOut = createHugeIcon(Core.ZoomOutIcon, "ZoomOut");
export const LuZoomOut = ZoomOut;
