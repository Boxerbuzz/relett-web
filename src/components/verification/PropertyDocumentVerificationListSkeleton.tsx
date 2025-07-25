import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { FileTextIcon } from "@phosphor-icons/react";

export function PropertyDocumentVerificationListSkeleton() {
  // Show 3 skeleton cards as placeholders
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileTextIcon className="w-5 h-5 text-gray-300" />
              <Skeleton className="h-4 w-32 rounded" />
              <Skeleton className="h-4 w-16 rounded ml-2" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-700 space-y-2">
              <div>
                <span className="font-medium">Type:</span>{" "}
                <Skeleton className="h-3 w-20 inline-block align-middle rounded" />
              </div>
              <div>
                <span className="font-medium">Uploaded:</span>{" "}
                <Skeleton className="h-3 w-24 inline-block align-middle rounded" />
              </div>
              <div>
                <span className="font-medium">File:</span>{" "}
                <Skeleton className="h-3 w-28 inline-block align-middle rounded" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
