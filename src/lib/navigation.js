import { Search, Heart, Star } from "lucide-react";

const navigationLinks = [
  {
    title: "Istraži",
    url: "/explore",
    icon: Search,
  },
  {
    title: "Spremljeno",
    url: "/saved",
    icon: Heart,
  },
  {
    title: "Ocijenjeno",
    url: "/rated",
    icon: Star,
  },
];

export { navigationLinks };
