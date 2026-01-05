"use client";

import React from "react";
import { motion } from "motion/react";
import {
  GraduationCap,
  Library,
  Mail,
  Globe,
  MessageSquare,
  ExternalLink,
  BookOpen,
  Calendar,
  Cloud,
  FileText,
  UserCheck,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const linkCategories = [
  {
    title: "Academic Resources",
    icon: <GraduationCap className="w-5 h-5" />,
    links: [
      {
        name: "LMS",
        description: "Learning Management System (Moodle)",
        url: "https://lms.astanait.edu.kz/",
        icon: <BookOpen className="w-4 h-4" />,
        badge: "Essential",
      },
      {
        name: "Registrar (OR)",
        description: "Grades, attendance, and registration",
        url: "https://registrar.astanait.edu.kz/",
        icon: <UserCheck className="w-4 h-4" />,
        badge: "Essential",
      },
      {
        name: "Library",
        description: "Electronic library and resources",
        url: "http://lib.astanait.edu.kz/",
        icon: <Library className="w-4 h-4" />,
      },
      {
        name: "Syllabus Explorer",
        description: "Browse course syllabi",
        url: "https://syllabus.astanait.edu.kz/",
        icon: <FileText className="w-4 h-4" />,
      },
    ],
  },
  {
    title: "Communication & Collaboration",
    icon: <MessageSquare className="w-5 h-5" />,
    links: [
      {
        name: "Microsoft Teams",
        description: "Online classes and team meetings",
        url: "https://teams.microsoft.com/",
        icon: <MessageSquare className="w-4 h-4" />,
        badge: "Daily",
      },
      {
        name: "Student Mail",
        description: "University Outlook email",
        url: "https://outlook.office.com/mail/",
        icon: <Mail className="w-4 h-4" />,
        badge: "Daily",
      },
      {
        name: "OneDrive",
        description: "Cloud storage for students",
        url: "https://onedrive.live.com/",
        icon: <Cloud className="w-4 h-4" />,
      },
    ],
  },
  {
    title: "University Information",
    icon: <Globe className="w-5 h-5" />,
    links: [
      {
        name: "AITU Website",
        description: "Official university portal",
        url: "https://astanait.edu.kz/",
        icon: <Globe className="w-4 h-4" />,
      },
      {
        name: "Academic Calendar",
        description: "Key dates and holidays",
        url: "https://astanait.edu.kz/academic-calendar/",
        icon: <Calendar className="w-4 h-4" />,
      },
      {
        name: "Document Templates",
        description: "Official forms and templates",
        url: "https://astanait.edu.kz/templates/",
        icon: <FileText className="w-4 h-4" />,
      },
    ],
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
  },
};

const Page = () => {
  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen bg-background text-foreground">
        <h1 className="text-4xl font-bold mb-2 underline bg-accent p-4 rounded-lg"> Work in progress</h1>
        <br />
      <header className="mb-10">
        <motion.h1
          className="text-4xl font-bold mb-2 "
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          University Resources
        </motion.h1>
        <motion.p
          className="text-muted-foreground text-lg"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          All important links to AITU services and tools in one place.
        </motion.p>
      </header>

      <motion.div
        className="grid gap-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {linkCategories.map((category, idx) => (
          <section key={idx}>
            <div className="flex items-center gap-2 mb-4">
              <span className="p-2 rounded-lg bg-primary/10 text-primary">
                {category.icon}
              </span>
              <h2 className="text-xl font-semibold">{category.title}</h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {category.links.map((link, linkIdx) => (
                <motion.div
                  key={linkIdx}
                  variants={itemVariants}
                //   whileHover={{ y: -5 }}
                  className="h-full"
                >
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block h-full group"
                  >
                    <Card className="h-full transition-all duration-300 border-border/50 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 bg-card/50 backdrop-blur-sm">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div className="p-2 rounded-md bg-muted text-muted-foreground group-hover:text-primary group-hover:bg-primary/5 transition-colors">
                            {link.icon}
                          </div>
                          {link.badge && (
                            <Badge
                              variant="secondary"
                              className="text-[10px] uppercase font-bold tracking-wider"
                            >
                              {link.badge}
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-base mt-2 flex items-center gap-1 group-hover:text-primary transition-colors">
                          {link.name}
                          <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-xs leading-relaxed line-clamp-2">
                          {link.description}
                        </CardDescription>
                      </CardContent>
                    </Card>
                  </a>
                </motion.div>
              ))}
            </div>
          </section>
        ))}
      </motion.div>

      {/* <footer className="mt-20 pt-10 border-t border-border/50 text-center text-muted-foreground text-sm">
        <p>Built for AITU Students. Stay organized.</p>
      </footer> */}
    </div>
  );
};
// TODO: more links: telegram chats/channels, instagram,  

export default Page;
