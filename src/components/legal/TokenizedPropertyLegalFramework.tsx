import React, { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertTriangle,
  FileText,
  Shield,
  Clock,
  CheckCircle,
  Eye,
  Info,
  Building,
  Coins,
  Scale,
  Users,
  TrendingUp,
  Lock,
  ArrowLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LegalFrameworkConfig, ReadingProgress } from "@/types/legal";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { getLegalSections } from "@/integrations/data/legals-fw";
import { useIsMobile } from "@/hooks/use-mobile";
import { XIcon } from "@phosphor-icons/react";

interface Props {
  config: LegalFrameworkConfig;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAgreementComplete: (agreementId: string) => void;
}

export const TokenizedPropertyLegalFramework: React.FC<Props> = ({
  config,
  open,
  onOpenChange,
  onAgreementComplete,
}) => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [currentSection, setCurrentSection] = useState(0);
  const [readingProgress, setReadingProgress] = useState<
    Record<string, ReadingProgress>
  >({});
  const [totalReadingTime, setTotalReadingTime] = useState(0);
  const [canProceed, setCanProceed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startTime] = useState(Date.now());
  const [mobileView, setMobileView] = useState<"list" | "detail">("list");

  const sections = getLegalSections(config.scenario);
  const requiredSections = sections.filter((s) => s.isRequired);
  const currentSectionData = sections[currentSection];

  // Function to mark current section as complete
  const markCurrentSectionComplete = () => {
    if (!currentSectionData) return;
    
    setReadingProgress((prev) => {
      const sectionProgress = prev[currentSectionData.id] || {
        sectionId: currentSectionData.id,
        timeSpent: 0,
        completed: false,
        lastVisited: new Date(),
      };

      return {
        ...prev,
        [currentSectionData.id]: {
          ...sectionProgress,
          completed: true,
          lastVisited: new Date(),
        },
      };
    });
  };

  // Track reading time for current section
  useEffect(() => {
    if (!currentSectionData || !open) return;

    const interval = setInterval(() => {
      setReadingProgress((prev) => {
        const sectionProgress = prev[currentSectionData.id] || {
          sectionId: currentSectionData.id,
          timeSpent: 0,
          completed: false,
          lastVisited: new Date(),
        };

        const newTimeSpent = sectionProgress.timeSpent + 1;
        // Remove the automatic completion based on time - let user actions control it
        const isCompleted = sectionProgress.completed;

        return {
          ...prev,
          [currentSectionData.id]: {
            ...sectionProgress,
            timeSpent: newTimeSpent,
            completed: isCompleted,
            lastVisited: new Date(),
          },
        };
      });

      setTotalReadingTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [currentSectionData, open]);

  // Check if user can proceed
  useEffect(() => {
    const allRequiredSectionsCompleted = requiredSections.every(
      (section) => readingProgress[section.id]?.completed
    );

    const minimumTimeReached =
      totalReadingTime >= (config.minimumReadingTime || 300); // 5 minutes default

    setCanProceed(allRequiredSectionsCompleted && minimumTimeReached);
  }, [
    readingProgress,
    totalReadingTime,
    requiredSections,
    config.minimumReadingTime,
  ]);

  const handleAgree = async () => {
    if (!canProceed) return;

    setIsSubmitting(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const agreementData = {
        user_id: user.id,
        agreement_type: config.scenario,
        version: "1.0.0",
        property_id: config.propertyDetails?.id,
        tokenized_property_id:
          config.scenario === "investment" ? config.propertyDetails?.id : null,
        reading_time_seconds: totalReadingTime,
        sections_completed: Object.keys(readingProgress),
        metadata: {
          scenario: config.scenario,
          propertyId: config.propertyDetails?.id,
          minimumReadingTime: config.minimumReadingTime,
          sectionsRead: Object.keys(readingProgress).length,
          userAgent: navigator.userAgent,
          completedAt: new Date().toISOString(),
        },
      };

      const { data, error } = await supabase
        .from("tokenization_legal_agreements")
        .insert(agreementData)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Legal Agreement Accepted",
        description: "You have successfully agreed to the legal framework.",
      });

      onAgreementComplete(data.id);
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving legal agreement:", error);
      toast({
        title: "Error",
        description: "Failed to save legal agreement. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getProgressPercentage = () => {
    const completedSections = Object.values(readingProgress).filter(
      (p) => p.completed
    ).length;
    return (completedSections / sections.length) * 100;
  };

  const getIconComponent = (iconName: string) => {
    const icons = {
      FileText,
      AlertTriangle,
      Building,
      TrendingUp,
      Coins,
      Users,
      Scale,
      Shield,
      Lock,
      Info,
    };
    const IconComponent = icons[iconName as keyof typeof icons] || FileText;
    return <IconComponent className="h-5 w-5" />;
  };

  const getRiskBadgeColor = (riskLevel: string) => {
    switch (riskLevel) {
      case "critical":
        return "destructive";
      case "high":
        return "destructive";
      case "medium":
        return "default";
      case "low":
        return "secondary";
      default:
        return "default";
    }
  };

  const handleSectionClick = (index: number) => {
    // Mark current section as complete before switching
    markCurrentSectionComplete();
    
    setCurrentSection(index);
    if (isMobile) {
      setMobileView("detail");
    }
  };

  const handleBackToList = () => {
    // Mark current section as complete before going back to list
    markCurrentSectionComplete();
    setMobileView("list");
  };

  const handleNextSection = () => {
    // Mark current section as complete before moving to next
    markCurrentSectionComplete();
    setCurrentSection(currentSection + 1);
  };

  const handlePreviousSection = () => {
    // Mark current section as complete before moving to previous
    markCurrentSectionComplete();
    setCurrentSection(Math.max(0, currentSection - 1));
  };

  if (!open) return null;

  // Mobile List View
  if (isMobile && mobileView === "list") {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50">
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Card className="w-full h-[90vh] flex flex-col">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">
                    {config.scenario === "tokenization"
                      ? "Property Tokenization"
                      : "Investment"}{" "}
                    Legal Framework
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Select a section to read
                  </p>
                </div>
                <Button variant="ghost" onClick={() => onOpenChange(false)}>
                  <XIcon size={20} />
                </Button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span>Reading Progress</span>
                  <span>{Math.round(getProgressPercentage())}% Complete</span>
                </div>
                <Progress value={getProgressPercentage()} className="h-2" />

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>
                      {Math.floor(totalReadingTime / 60)}:
                      {(totalReadingTime % 60).toString().padStart(2, "0")}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    <span>
                      {
                        Object.values(readingProgress).filter(
                          (p) => p.completed
                        ).length
                      }
                      /{sections.length} sections
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>

            <ScrollArea className="flex-1 p-4">
              <div className="space-y-3">
                {sections.map((section, index) => {
                  const progress = readingProgress[section.id];
                  const isCompleted = progress?.completed || false;

                  return (
                    <div
                      key={section.id}
                      className={cn(
                        "flex items-start gap-3 p-4 rounded-lg cursor-pointer border transition-colors",
                        isCompleted && "bg-green-50 border-green-200",
                        !isCompleted && "hover:bg-muted"
                      )}
                      onClick={() => handleSectionClick(index)}
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        {getIconComponent(section.icon)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-sm truncate">
                            {section.title}
                          </h4>
                          <div className="flex items-center gap-2">
                            {isCompleted && (
                              <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                            )}
                            <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge
                            variant={
                              getRiskBadgeColor(section.riskLevel) as any
                            }
                            className="text-xs"
                          >
                            {section.riskLevel}
                          </Badge>
                          {section.isRequired && (
                            <Badge variant="outline" className="text-xs">
                              Required
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs mt-2 text-muted-foreground">
                          {progress ? `${progress.timeSpent}s` : "0s"} /{" "}
                          {section.minimumReadTime}s
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>

            <div className="p-4 border-t bg-muted/30">
              <Button
                onClick={handleAgree}
                disabled={!canProceed || isSubmitting}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? "Processing..." : "I Agree & Accept"}
              </Button>

              {!canProceed && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 text-yellow-600 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-yellow-800">
                        Requirements not met:
                      </p>
                      <ul className="mt-1 space-y-1 text-yellow-700">
                        {requiredSections.some(
                          (s) => !readingProgress[s.id]?.completed
                        ) && <li>• Complete reading all required sections</li>}
                        {totalReadingTime <
                          (config.minimumReadingTime || 300) && (
                          <li>
                            • Spend minimum reading time (
                            {Math.ceil((config.minimumReadingTime || 300) / 60)}{" "}
                            minutes)
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Mobile Detail View
  if (isMobile && mobileView === "detail") {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50">
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Card className="w-full h-[90vh] flex flex-col">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  onClick={handleBackToList}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to List
                </Button>
                <Button variant="ghost" onClick={() => onOpenChange(false)}>
                  <XIcon size={20} />
                </Button>
              </div>

              <div className="flex items-center gap-3 mt-4">
                {getIconComponent(currentSectionData.icon)}
                <div>
                  <h2 className="text-lg font-semibold">
                    {currentSectionData.title}
                  </h2>
                  <Badge
                    variant={
                      getRiskBadgeColor(currentSectionData.riskLevel) as any
                    }
                    className="mt-1"
                  >
                    {currentSectionData.riskLevel} risk
                  </Badge>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-3">
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>
                    {readingProgress[currentSectionData.id]?.timeSpent || 0}s /{" "}
                    {currentSectionData.minimumReadTime}s
                  </span>
                </div>
                {readingProgress[currentSectionData.id]?.completed && (
                  <div className="flex items-center gap-1 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span>Section completed</span>
                  </div>
                )}
              </div>
            </CardHeader>

            <ScrollArea className="flex-1 p-6">
              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {currentSectionData.content}
                </div>
              </div>
            </ScrollArea>

            <div className="p-4 border-t bg-muted/30">
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={handlePreviousSection}
                  disabled={currentSection === 0}
                >
                  Previous
                </Button>

                {currentSection < sections.length - 1 ? (
                  <Button onClick={handleNextSection}>
                    Next
                  </Button>
                ) : (
                  <Button
                    onClick={handleAgree}
                    disabled={!canProceed || isSubmitting}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isSubmitting ? "Processing..." : "I Agree & Accept"}
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Desktop View (Original Design)
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50">
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Card className="w-full h-[90vh] flex flex-col">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">
                  {config.scenario === "tokenization"
                    ? "Property Tokenization"
                    : "Investment"}{" "}
                  Legal Framework
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Please read all sections carefully before proceeding
                </p>
              </div>
              <Button variant="ghost" onClick={() => onOpenChange(false)}>
                ×
              </Button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span>Reading Progress</span>
                <span>{Math.round(getProgressPercentage())}% Complete</span>
              </div>
              <Progress value={getProgressPercentage()} className="h-2" />

              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>
                    {Math.floor(totalReadingTime / 60)}:
                    {(totalReadingTime % 60).toString().padStart(2, "0")}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  <span>
                    {
                      Object.values(readingProgress).filter((p) => p.completed)
                        .length
                    }
                    /{sections.length} sections
                  </span>
                </div>
              </div>
            </div>
          </CardHeader>

          <div className="flex-1 flex overflow-hidden">
            {/* Section Navigation */}
            <div className="w-90 border-r bg-muted/30">
              <ScrollArea className="h-full p-4">
                <div className="space-y-2">
                  {sections.map((section, index) => {
                    const progress = readingProgress[section.id];
                    const isCompleted = progress?.completed || false;
                    const isActive = index === currentSection;

                    return (
                      <div
                        key={section.id}
                        className={cn(
                          "flex items-start gap-3 p-3 rounded-lg cursor-pointer border transition-colors",
                          isActive && "bg-primary text-primary-foreground",
                          !isActive &&
                            isCompleted &&
                            "bg-green-50 border-green-200",
                          !isActive && !isCompleted && "hover:bg-muted"
                        )}
                        onClick={() => setCurrentSection(index)}
                      >
                        <div className="flex-shrink-0 mt-0.5">
                          {getIconComponent(section.icon)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-sm truncate">
                              {section.title}
                            </h4>
                            {isCompleted && (
                              <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge
                              variant={
                                getRiskBadgeColor(section.riskLevel) as any
                              }
                              className="text-xs"
                            >
                              {section.riskLevel}
                            </Badge>
                            {section.isRequired && (
                              <Badge variant="outline" className="text-xs">
                                Required
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs mt-1 opacity-70">
                            {progress ? `${progress.timeSpent}s` : "0s"} /{" "}
                            {section.minimumReadTime}s
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>

            {/* Section Content */}
            <div className="flex-1 flex flex-col">
              <div className="p-6 border-b">
                <div className="flex items-center gap-3 mb-4">
                  {getIconComponent(currentSectionData.icon)}
                  <h2 className="text-lg font-semibold">
                    {currentSectionData.title}
                  </h2>
                  <Badge
                    variant={
                      getRiskBadgeColor(currentSectionData.riskLevel) as any
                    }
                  >
                    {currentSectionData.riskLevel} risk
                  </Badge>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    <span>
                      {readingProgress[currentSectionData.id]?.timeSpent || 0}s
                      / {currentSectionData.minimumReadTime}s
                    </span>
                  </div>
                  {readingProgress[currentSectionData.id]?.completed && (
                    <div className="flex items-center gap-1 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span>Section completed</span>
                    </div>
                  )}
                </div>
              </div>

              <ScrollArea className="flex-1 p-6">
                <div className="prose prose-sm max-w-none">
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {currentSectionData.content}
                  </div>
                </div>
              </ScrollArea>

              <div className="p-6 border-t bg-muted/30">
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    onClick={handlePreviousSection}
                    disabled={currentSection === 0}
                  >
                    Previous Section
                  </Button>

                  {currentSection < sections.length - 1 ? (
                    <Button onClick={handleNextSection}>
                      Next Section
                    </Button>
                  ) : (
                    <Button
                      onClick={handleAgree}
                      disabled={!canProceed || isSubmitting}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {isSubmitting ? "Processing..." : "I Agree & Accept"}
                    </Button>
                  )}
                </div>

                {!canProceed && (
                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Info className="h-4 w-4 text-yellow-600 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-yellow-800">
                          Requirements not met:
                        </p>
                        <ul className="mt-1 space-y-1 text-yellow-700">
                          {requiredSections.some(
                            (s) => !readingProgress[s.id]?.completed
                          ) && (
                            <li>• Complete reading all required sections</li>
                          )}
                          {totalReadingTime <
                            (config.minimumReadingTime || 300) && (
                            <li>
                              • Spend minimum reading time (
                              {Math.ceil(
                                (config.minimumReadingTime || 300) / 60
                              )}{" "}
                              minutes)
                            </li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
