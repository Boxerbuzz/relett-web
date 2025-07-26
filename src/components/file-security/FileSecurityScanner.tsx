import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  ShieldIcon,
  WarningIcon,
  CheckCircleIcon,
  UploadSimpleIcon,
} from "@phosphor-icons/react";
import { useFileValidation } from "@/hooks/useFileValidation";

interface FileSecurityScannerProps {
  file: File;
  fileType: "image" | "document";
  onValidationComplete: (result: any) => void;
  onValidationError: (error: string) => void;
}

export function FileSecurityScanner({
  file,
  fileType,
  onValidationComplete,
  onValidationError,
}: FileSecurityScannerProps) {
  const [scanResult, setScanResult] = useState<any>(null);
  const { validateFile, isValidating } = useFileValidation();

  const handleScan = async () => {
    try {
      const result = await validateFile(file, fileType);
      setScanResult(result);

      if (result.isValid) {
        onValidationComplete(result);
      } else {
        onValidationError(result.errors.join(", "));
      }
    } catch (error) {
      onValidationError("File validation failed");
    }
  };

  const getStatusIcon = () => {
    if (isValidating)
      return <ShieldIcon className="h-5 w-5 text-blue-500 animate-pulse" />;
    if (!scanResult) return <ShieldIcon className="h-5 w-5 text-gray-400" />;
    if (scanResult.isValid)
      return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
    return <WarningIcon className="h-5 w-5 text-red-500" />;
  };

  const getStatusText = () => {
    if (isValidating) return "Scanning file...";
    if (!scanResult) return "Ready to scan";
    if (scanResult.isValid) return "File is safe";
    return "Security issues detected";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getStatusIcon()}
          File Security Scanner
        </CardTitle>
        <CardDescription>
          Scan file for malware and validate content
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div>
            <div className="font-medium">{file.name}</div>
            <div className="text-sm text-gray-600">
              {(file.size / 1024 / 1024).toFixed(2)} MB • {file.type}
            </div>
          </div>
          <UploadSimpleIcon className="h-5 w-5 text-gray-400" />
        </div>

        {isValidating && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Scanning progress</span>
              <span>Running security checks...</span>
            </div>
            <Progress value={75} className="w-full" />
          </div>
        )}

        {scanResult && (
          <div className="space-y-3">
            <div
              className={`p-3 rounded-lg border ${
                scanResult.isValid
                  ? "bg-green-50 border-green-200"
                  : "bg-red-50 border-red-200"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                {getStatusIcon()}
                <span className="font-medium">{getStatusText()}</span>
              </div>

              {!scanResult.isValid && (
                <ul className="text-sm text-red-700 space-y-1">
                  {scanResult.errors.map((error: string, index: number) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-medium">Original Size</div>
                <div className="text-gray-600">
                  {(scanResult.metadata.originalSize / 1024 / 1024).toFixed(2)}{" "}
                  MB
                </div>
              </div>
              <div>
                <div className="font-medium">Final Size</div>
                <div className="text-gray-600">
                  {(scanResult.metadata.finalSize / 1024 / 1024).toFixed(2)} MB
                </div>
              </div>
              {scanResult.metadata.dimensions && (
                <>
                  <div>
                    <div className="font-medium">Dimensions</div>
                    <div className="text-gray-600">
                      {scanResult.metadata.dimensions.width} ×{" "}
                      {scanResult.metadata.dimensions.height}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {!scanResult && !isValidating && (
          <Button onClick={handleScan} className="w-full">
            <ShieldIcon className="h-4 w-4 mr-2" />
            Scan File
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
