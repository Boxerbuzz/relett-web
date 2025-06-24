"use client";
import * as React from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Send, MoreVertical, User } from "lucide-react";
import { cn } from "@/lib/utils";

type Mail = {
  id: string;
  name: string;
  email: string;
  subject: string;
  date: string;
  teaser: string;
  content: string;
};

const mails: Mail[] = [
  {
    id: "1",
    name: "William Smith",
    email: "williamsmith@example.com",
    subject: "Meeting Tomorrow",
    date: "09:34 AM",
    teaser:
      "Hi team, just a reminder about our meeting tomorrow at 10 AM.\nPlease come prepared with your project updates.",
    content:
      "Hi team,\n\nJust a reminder about our meeting tomorrow at 10 AM. Please come prepared with your project updates.\n\nWe'll be discussing:\n- Q3 progress reports\n- Budget allocations for Q4\n- Team restructuring plans\n\nLooking forward to seeing everyone there.\n\nBest regards,\nWilliam",
  },
  {
    id: "2",
    name: "Alice Smith",
    email: "alicesmith@example.com",
    subject: "Re: Project Update",
    date: "Yesterday",
    teaser:
      "Thanks for the update. The progress looks great so far.\nLet's schedule a call to discuss the next steps.",
    content:
      "Hi there,\n\nThanks for the comprehensive update. The progress looks great so far and I'm impressed with the team's dedication.\n\nLet's schedule a call to discuss the next steps and potential roadblocks.\n\nAvailable times:\n- Tomorrow 2-4 PM\n- Thursday 10 AM - 12 PM\n- Friday morning\n\nLet me know what works best for you.\n\nBest,\nAlice",
  },
  {
    id: "3",
    name: "Bob Johnson",
    email: "bobjohnson@example.com",
    subject: "Weekend Plans",
    date: "2 days ago",
    teaser:
      "Hey everyone! I'm thinking of organizing a team outing this weekend.\nWould you be interested in a hiking trip or a beach day?",
    content:
      "Hey everyone!\n\nI'm thinking of organizing a team outing this weekend to help everyone unwind after this intense project sprint.\n\nI have two options in mind:\n1. Hiking trip to Mount Wilson (moderate difficulty, great views)\n2. Beach day at Santa Monica (relaxing, good food nearby)\n\nWould you be interested in either? Please let me know your preference and if you have any dietary restrictions for the group lunch.\n\nLooking forward to some team bonding!\n\nCheers,\nBob",
  },
  {
    id: "4",
    name: "Emily Davis",
    email: "emilydavis@example.com",
    subject: "Re: Question about Budget",
    date: "2 days ago",
    teaser:
      "I've reviewed the budget numbers you sent over.\nCan we set up a quick call to discuss some potential adjustments?",
    content:
      "Hello,\n\nI've reviewed the budget numbers you sent over and they look mostly good. However, I have some concerns about the marketing allocation.\n\nCan we set up a quick call to discuss some potential adjustments? I think we might be able to optimize our spending in a few areas.\n\nSpecific points to discuss:\n- Marketing budget seems high for Q4\n- Development resources might need more allocation\n- Training budget appears insufficient\n\nWhen would be a good time for you?\n\nRegards,\nEmily",
  },
  {
    id: "5",
    name: "Michael Wilson",
    email: "michaelwilson@example.com",
    subject: "Important Announcement",
    date: "1 week ago",
    teaser:
      "Please join us for an all-hands meeting this Friday at 3 PM.\nWe have some exciting news to share about the company's future.",
    content:
      "Dear Team,\n\nPlease join us for an all-hands meeting this Friday at 3 PM in the main conference room. We have some exciting news to share about the company's future.\n\nAgenda:\n- Company growth updates\n- New partnership announcements\n- Team expansion plans\n- Q4 strategic initiatives\n- Q&A session\n\nLight refreshments will be provided. Please confirm your attendance by Thursday EOD.\n\nLooking forward to sharing this exciting news with everyone!\n\nBest regards,\nMichael Wilson\nCEO",
  },
  {
    id: "6",
    name: "Sarah Brown",
    email: "sarahbrown@example.com",
    subject: "Re: Feedback on Proposal",
    date: "1 week ago",
    teaser:
      "Thank you for sending over the proposal. I've reviewed it and have some thoughts.\nCould we schedule a meeting to discuss my feedback in detail?",
    content:
      "Hi,\n\nThank you for sending over the proposal. I've reviewed it thoroughly and have some thoughts that I'd like to discuss.\n\nOverall, the proposal is well-structured and addresses most of our requirements. However, I have some suggestions for improvement:\n\n1. Timeline seems aggressive for the scope\n2. Budget allocation for testing phase needs revision\n3. Risk mitigation strategies could be more detailed\n\nCould we schedule a meeting to discuss my feedback in detail? I'm available most afternoons this week.\n\nBest regards,\nSarah",
  },
  {
    id: "7",
    name: "David Lee",
    email: "davidlee@example.com",
    subject: "New Project Idea",
    date: "1 week ago",
    teaser:
      "I've been brainstorming and came up with an interesting project concept.\nDo you have time this week to discuss its potential impact and feasibility?",
    content:
      "Hello,\n\nI've been brainstorming during my commute and came up with an interesting project concept that could significantly improve our user engagement.\n\nThe idea involves implementing an AI-powered recommendation system that learns from user behavior patterns. Based on my preliminary research, this could increase user retention by 25-30%.\n\nDo you have time this week to discuss its potential impact and feasibility? I've prepared a brief presentation with market research and technical requirements.\n\nLet me know when you're available!\n\nBest,\nDavid",
  },
  {
    id: "8",
    name: "Olivia Wilson",
    email: "oliviawilson@example.com",
    subject: "Vacation Plans",
    date: "1 week ago",
    teaser:
      "Just a heads up that I'll be taking a two-week vacation next month.\nI'll make sure all my projects are up to date before I leave.",
    content:
      "Hi everyone,\n\nJust a heads up that I'll be taking a two-week vacation next month (March 15-29) to visit family in Europe.\n\nI'll make sure all my projects are up to date before I leave and will brief the team on current priorities. I'm also planning to finish the user research report by March 10th.\n\nFor urgent matters during my absence, please contact Sarah as she'll be covering my responsibilities.\n\nI'll have limited email access but will check messages every few days for anything critical.\n\nThanks for understanding!\n\nOlivia",
  },
  {
    id: "9",
    name: "James Martin",
    email: "jamesmartin@example.com",
    subject: "Re: Conference Registration",
    date: "1 week ago",
    teaser:
      "I've completed the registration for the upcoming tech conference.\nLet me know if you need any additional information from my end.",
    content:
      "Hi,\n\nI've completed the registration for the upcoming tech conference (TechSummit 2024). Here are the details:\n\nConference: TechSummit 2024\nDate: April 15-17, 2024\nLocation: San Francisco Convention Center\nRegistration confirmation: #TS2024-8829\n\nI've registered for the following sessions:\n- AI and Machine Learning Track\n- Product Development Workshop\n- Leadership in Tech panel\n\nLet me know if you need any additional information from my end, such as the full agenda or accommodation details.\n\nLooking forward to the learning opportunities!\n\nRegards,\nJames",
  },
  {
    id: "10",
    name: "Sophia White",
    email: "sophiawhite@example.com",
    subject: "Team Dinner",
    date: "1 week ago",
    teaser:
      "To celebrate our recent project success, I'd like to organize a team dinner.\nAre you available next Friday evening? Please let me know your preferences.",
    content:
      "Hi team,\n\nTo celebrate our recent project success and the successful launch of the new feature, I'd like to organize a team dinner.\n\nI was thinking next Friday evening around 7 PM. I have a few restaurant options in mind:\n\n1. Italian Bistro downtown (great pasta, wine selection)\n2. Modern American restaurant (diverse menu, good for dietary restrictions)\n3. Asian fusion place (unique dishes, great reviews)\n\nAre you available next Friday evening? Please let me know your preferences for:\n- Restaurant choice\n- Any dietary restrictions\n- Preferred time (7 PM or 8 PM)\n\nThis will be a great opportunity to unwind and celebrate our hard work!\n\nLooking forward to it,\nSophia",
  },
];

type ViewMode = "list" | "detail";

export function Messaging() {
  const [selectedMail, setSelectedMail] = React.useState<Mail | null>(null);
  const [viewMode, setViewMode] = React.useState<ViewMode>("list");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [showUnreadsOnly, setShowUnreadsOnly] = React.useState(false);

  // Handle message selection
  const handleMailSelect = (mail: Mail) => {
    setSelectedMail(mail);
    setViewMode("detail");
  };

  // Handle back to list (mobile/tablet)
  const handleBackToList = () => {
    setViewMode("list");
    setSelectedMail(null);
  };

  // Filter mails based on search query
  const filteredMails = mails.filter(
    (mail) =>
      mail.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mail.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mail.teaser.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-full">
      {/* Messages List Panel */}
      <div
        className={cn(
          "w-full lg:w-80 border-r border-border bg-background overflow-hidden transition-all duration-300",
          // On mobile/tablet: show/hide based on viewMode
          "lg:block",
          viewMode === "list" ? "block" : "hidden lg:block"
        )}
      >
        <div className="gap-3.5 border-b p-4">
          <div className="flex w-full items-center justify-between mb-4">
            <div className="text-foreground text-base font-medium">
              Messages
            </div>
            <Label className="flex items-center gap-2 text-sm">
              <span className="hidden sm:inline">Unreads</span>
              <Switch
                className="shadow-none"
                checked={showUnreadsOnly}
                onCheckedChange={setShowUnreadsOnly}
              />
            </Label>
          </div>
          <Input
            placeholder="Type to search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="overflow-y-auto h-[calc(100vh-200px)]">
          <div className="px-0">
            <div>
              {filteredMails.map((mail) => (
                <button
                  title={mail.subject}
                  type="button"
                  key={mail.id}
                  onClick={() => handleMailSelect(mail)}
                  className={cn(
                    "w-full hover:bg-muted hover:text-foreground flex flex-col items-start gap-2 border-b p-4 text-sm leading-tight text-left last:border-b-0 transition-colors",
                    selectedMail?.id === mail.id && "bg-muted"
                  )}
                >
                  <div className="flex w-full items-center gap-2">
                    <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center shrink-0">
                      <User className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex flex-col w-full">
                      <span className="font-medium truncate">{mail.name}</span>
                      <span className="line-clamp-1 w-full text-xs text-muted-foreground text-left">
                        {mail.teaser}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
              {filteredMails.length === 0 && (
                <div className="p-8 text-center text-muted-foreground">
                  <p className="text-sm">No messages found</p>
                  {searchQuery && (
                    <p className="text-xs mt-1">
                      Try adjusting your search query
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div
        className={cn(
          "flex-1 flex flex-col transition-all duration-300",
          // On mobile/tablet: show/hide based on viewMode
          "lg:flex",
          viewMode === "detail" ? "flex" : "hidden lg:flex"
        )}
      >
        <header className="bg-background sticky top-0 flex shrink-0 items-center gap-2 border-b p-4">
          {/* Back button for mobile/tablet */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToList}
            className="lg:hidden"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>

          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="#">All Inboxes</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>
                  {selectedMail ? selectedMail.subject : "Inbox"}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {selectedMail && (
            <div className="ml-auto">
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          )}
        </header>

        <div className="flex flex-1 flex-col overflow-y-auto">
          {selectedMail ? (
            // Message Detail View
            <div className="flex flex-col h-full">
              {/* Message Header */}
              <div className="border-b p-6 bg-background">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h1 className="text-xl font-semibold mb-2">
                      {selectedMail.subject}
                    </h1>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">
                        {selectedMail.name}
                      </span>
                      <span>&lt;{selectedMail.email}&gt;</span>
                      <span className="ml-auto">{selectedMail.date}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Message Content */}
              <div className="flex-1 p-6 h-[calc(100vh-200px)] overflow-y-auto">
                <div className="prose prose-sm max-w-none">
                  {selectedMail.content.split("\n").map((paragraph, index) => (
                    <p
                      key={index}
                      className="mb-4 last:mb-0 text-sm leading-relaxed"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>

              {/* Reply Section */}
              <div className="border-t p-4 bg-background">
                <div className="flex items-center gap-2">
                  <Input placeholder="Type your reply..." className="flex-1" />
                  <Button size="sm">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            // Empty State
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center text-muted-foreground max-w-md">
                <h3 className="text-lg font-medium mb-2">
                  Select a conversation
                </h3>
                <p className="text-sm">
                  Choose a message from the list to start reading and replying.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
