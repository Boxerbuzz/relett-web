import { LandTitleManagement } from "@/components/land-titles/LandTitleManagement";

export default function LandTitles() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Land Title Management</h1>
        <p className="text-gray-600">
          Manage property deeds and land titles for tokenization
        </p>
      </div>
      <LandTitleManagement />
    </div>
  );
}