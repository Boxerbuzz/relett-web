"use client";

import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  MagnifyingGlassPlusIcon as ZoomIn,
  MagnifyingGlassMinusIcon as ZoomOut,
  ArrowClockwiseIcon as RotateCw,
  DownloadSimpleIcon as Download,
  ArrowLeftIcon as ArrowLeft,
  ChatTextIcon as MessageSquare,
  CheckIcon as Check,
  XIcon as X,
  WarningCircleIcon as AlertTriangle,
  FileTextIcon as FileText,
} from "@phosphor-icons/react";

interface Annotation {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  comment: string;
  type: "note" | "issue" | "approved";
  timestamp: string;
}

interface DocumentViewerProps {
  documentUrl: string;
  documentName: string;
  mimeType: string;
  onClose: () => void;
  onAnnotate?: (annotations: Annotation[]) => void;
  isVerificationMode?: boolean;
  existingAnnotations?: Annotation[];
}

export function DocumentViewer({
  documentUrl,
  documentName,
  mimeType,
  onClose,
  onAnnotate,
  isVerificationMode = false,
  existingAnnotations = [],
}: DocumentViewerProps) {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [annotations, setAnnotations] =
    useState<Annotation[]>(existingAnnotations);
  const [isAddingAnnotation, setIsAddingAnnotation] = useState(false);
  const [selectedArea, setSelectedArea] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const [annotationComment, setAnnotationComment] = useState("");
  const [annotationType, setAnnotationType] = useState<
    "note" | "issue" | "approved"
  >("note");
  const [mouseDown, setMouseDown] = useState(false);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(
    null
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.25, 0.25));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isAddingAnnotation) return;

    const rect = imageRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;

    setMouseDown(true);
    setStartPos({ x, y });
    setSelectedArea({ x, y, width: 0, height: 0 });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!mouseDown || !startPos || !isAddingAnnotation) return;

    const rect = imageRef.current?.getBoundingClientRect();
    if (!rect) return;

    const currentX = (e.clientX - rect.left) / scale;
    const currentY = (e.clientY - rect.top) / scale;

    setSelectedArea({
      x: Math.min(startPos.x, currentX),
      y: Math.min(startPos.y, currentY),
      width: Math.abs(currentX - startPos.x),
      height: Math.abs(currentY - startPos.y),
    });
  };

  const handleMouseUp = () => {
    setMouseDown(false);
    if (selectedArea && selectedArea.width > 10 && selectedArea.height > 10) {
      // Keep the selected area for annotation
    } else {
      setSelectedArea(null);
    }
  };

  const addAnnotation = () => {
    if (!selectedArea || !annotationComment.trim()) return;

    const newAnnotation: Annotation = {
      id: Date.now().toString(),
      ...selectedArea,
      comment: annotationComment,
      type: annotationType,
      timestamp: new Date().toISOString(),
    };

    const updatedAnnotations = [...annotations, newAnnotation];
    setAnnotations(updatedAnnotations);
    onAnnotate?.(updatedAnnotations);

    // Reset
    setSelectedArea(null);
    setAnnotationComment("");
    setIsAddingAnnotation(false);
  };

  const removeAnnotation = (id: string) => {
    const updatedAnnotations = annotations.filter((a) => a.id !== id);
    setAnnotations(updatedAnnotations);
    onAnnotate?.(updatedAnnotations);
  };

  const getAnnotationColor = (type: string) => {
    switch (type) {
      case "approved":
        return "border-green-500 bg-green-500/20";
      case "issue":
        return "border-red-500 bg-red-500/20";
      default:
        return "border-blue-500 bg-blue-500/20";
    }
  };

  const getAnnotationIcon = (type: string) => {
    switch (type) {
      case "approved":
        return <Check className="h-3 w-3" />;
      case "issue":
        return <AlertTriangle className="h-3 w-3" />;
      default:
        return <MessageSquare className="h-3 w-3" />;
    }
  };

  const isImageFile = mimeType.startsWith("image/");
  const isPdfFile = mimeType === "application/pdf";

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex flex-col md:flex-row h-full w-full top-0 left-0">
      {/* Sidebar / Topbar */}
      <div className="md:w-80 w-full bg-white border-b md:border-b-0 md:border-r overflow-y-auto md:h-full h-auto">
        <div className="p-4 border-b flex flex-col md:block">
          <div className="flex items-center justify-between gap-2 mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              <span className="hidden md:inline">Back</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(documentUrl, "_blank")}
              className="flex items-center"
            >
              <Download className="h-4 w-4 mr-2" />
              <span className="hidden md:inline">Download</span>
            </Button>
          </div>
          <h3 className="font-semibold text-lg truncate">{documentName}</h3>
          <p className="text-sm text-muted-foreground">Document Viewer</p>
        </div>

        {/* Controls */}
        <div className="p-4 border-b space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Zoom</span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomOut}
                className="w-8 h-8 p-0"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-sm min-w-12 text-center">
                {Math.round(scale * 100)}%
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomIn}
                className="w-8 h-8 p-0"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Rotate</span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRotate}
              className="w-8 h-8 p-0"
            >
              <RotateCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Annotations */}
        {isVerificationMode && (
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Annotations</h4>
              <Button
                size="sm"
                variant={isAddingAnnotation ? "destructive" : "default"}
                onClick={() => setIsAddingAnnotation(!isAddingAnnotation)}
                className="md:w-auto w-full ml-2 md:ml-0"
              >
                {isAddingAnnotation ? "Cancel" : "Add Note"}
              </Button>
            </div>

            {isAddingAnnotation && (
              <Card>
                <CardContent className="p-3 space-y-3">
                  <div>
                    <label className="text-sm font-medium">Type</label>
                    <select
                      aria-label="Annotation Type"
                      aria-required="true"
                      value={annotationType}
                      onChange={(e) => setAnnotationType(e.target.value as any)}
                      className="w-full mt-1 p-2 border rounded"
                    >
                      <option value="note">Note</option>
                      <option value="issue">Issue</option>
                      <option value="approved">Approved</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Comment</label>
                    <Textarea
                      value={annotationComment}
                      onChange={(e) => setAnnotationComment(e.target.value)}
                      placeholder="Add your comment..."
                      rows={3}
                      className="mt-1"
                    />
                  </div>
                  {selectedArea && (
                    <Button
                      size="sm"
                      onClick={addAnnotation}
                      disabled={!annotationComment.trim()}
                      className="w-full md:w-auto"
                    >
                      Add Annotation
                    </Button>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {selectedArea
                      ? "Tap and drag on the document to select an area"
                      : 'Click "Add Annotation" to save'}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Existing Annotations */}
            <div className="space-y-2">
              {annotations.map((annotation) => (
                <Card key={annotation.id} className="p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-2">
                      <div
                        className={`p-1 rounded ${getAnnotationColor(
                          annotation.type
                        )}`}
                      >
                        {getAnnotationIcon(annotation.type)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm break-words">
                          {annotation.comment}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(annotation.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAnnotation(annotation.id)}
                      className="w-8 h-8 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Document View */}
      <div className="flex-1 bg-gray-100 overflow-auto" ref={containerRef}>
        <div className="p-2 md:p-4 h-full flex items-center justify-center">
          <div
            className="relative w-full h-full flex items-center justify-center"
            style={{
              transform: `scale(${scale}) rotate(${rotation}deg)`,
              transformOrigin: "center",
              minHeight: "60vh",
              maxHeight: "90vh",
            }}
          >
            {isImageFile ? (
              <div className="relative w-full h-full flex items-center justify-center">
                <img
                  ref={imageRef}
                  src={documentUrl}
                  alt={documentName}
                  className="max-w-full max-h-[70vh] md:max-h-full cursor-crosshair object-contain mx-auto"
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  draggable={false}
                  style={{ touchAction: "none" }}
                />
                {/* Selection Area */}
                {selectedArea && (
                  <div
                    className="absolute border-2 border-blue-500 bg-blue-500/20 pointer-events-none"
                    style={{
                      left: selectedArea.x * scale,
                      top: selectedArea.y * scale,
                      width: selectedArea.width * scale,
                      height: selectedArea.height * scale,
                    }}
                  />
                )}
                {/* Existing Annotations */}
                {annotations.map((annotation) => (
                  <div
                    key={annotation.id}
                    className={`absolute border-2 ${getAnnotationColor(
                      annotation.type
                    )} pointer-events-none`}
                    style={{
                      left: annotation.x * scale,
                      top: annotation.y * scale,
                      width: annotation.width * scale,
                      height: annotation.height * scale,
                    }}
                  >
                    <div className="absolute -top-6 left-0 bg-white border rounded px-1 py-0.5 text-xs shadow">
                      {getAnnotationIcon(annotation.type)}
                    </div>
                  </div>
                ))}
              </div>
            ) : isPdfFile ? (
              <iframe
                src={documentUrl}
                className="w-full h-full border rounded"
                title={documentName}
              />
            ) : (
              <div className="p-8 text-center w-full">
                <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <p className="text-lg">Preview not available</p>
                <p className="text-sm text-muted-foreground mb-4">
                  This file type cannot be previewed. Download to view.
                </p>
                <Button
                  onClick={() => window.open(documentUrl, "_blank")}
                  className="w-full md:w-auto"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download File
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
