import { Link } from "@remix-run/react";
import { LucideIcon } from "lucide-react";

interface CardProps {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  color?:
    | "green"
    | "blue"
    | "red"
    | "purple"
    | "orange"
    | "teal"
    | "gray"
    | "indigo"
    | "pink"
    | "yellow";
  className?: string;
}

const colorVariants = {
  green: {
    bg: "bg-gradient-to-br from-green-400 to-green-600",
    hover: "hover:from-green-500 hover:to-green-700",
    icon: "bg-green-500",
  },
  blue: {
    bg: "bg-gradient-to-br from-blue-400 to-blue-600",
    hover: "hover:from-blue-500 hover:to-blue-700",
    icon: "bg-blue-500",
  },
  red: {
    bg: "bg-gradient-to-br from-red-400 to-red-600",
    hover: "hover:from-red-500 hover:to-red-700",
    icon: "bg-red-500",
  },
  purple: {
    bg: "bg-gradient-to-br from-purple-400 to-purple-600",
    hover: "hover:from-purple-500 hover:to-purple-700",
    icon: "bg-purple-500",
  },
  orange: {
    bg: "bg-gradient-to-br from-orange-400 to-orange-600",
    hover: "hover:from-orange-500 hover:to-orange-700",
    icon: "bg-orange-500",
  },
  teal: {
    bg: "bg-gradient-to-br from-teal-400 to-teal-600",
    hover: "hover:from-teal-500 hover:to-teal-700",
    icon: "bg-teal-500",
  },
  gray: {
    bg: "bg-gradient-to-br from-gray-400 to-gray-600",
    hover: "hover:from-gray-500 hover:to-gray-700",
    icon: "bg-gray-500",
  },
  indigo: {
    bg: "bg-gradient-to-br from-indigo-400 to-indigo-600",
    hover: "hover:from-indigo-500 hover:to-indigo-700",
    icon: "bg-indigo-500",
  },
  pink: {
    bg: "bg-gradient-to-br from-pink-400 to-pink-600",
    hover: "hover:from-pink-500 hover:to-pink-700",
    icon: "bg-pink-500",
  },
  yellow: {
    bg: "bg-gradient-to-br from-yellow-400 to-yellow-600",
    hover: "hover:from-yellow-500 hover:to-yellow-700",
    icon: "bg-yellow-500",
  },
};

export default function Card({
  title,
  description,
  href,
  icon: Icon,
  color = "blue",
  className = "",
}: CardProps) {
  const colors = colorVariants[color];

  return (
    <Link
      to={href}
      className={`block p-6 rounded-xl ${colors.bg} ${colors.hover} transition-all duration-300 transform hover:scale-105 hover:shadow-lg group ${className}`}
      prefetch="intent"
    >
      <div className="flex items-center mb-4">
        <div className={`p-3 rounded-lg ${colors.icon} mr-4`}>
          <Icon size={24} className="text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-800 group-hover:text-white transition-colors duration-300">
          {title}
        </h3>
      </div>
      <p className="text-gray-600 group-hover:text-gray-100 transition-colors duration-300">
        {description}
      </p>
    </Link>
  );
}
