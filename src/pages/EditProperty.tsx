import { useParams, useNavigate } from "react-router-dom";
import { EditPropertyForm } from "@/components/property/EditPropertyForm";

export default function EditProperty() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  if (!id) {
    navigate("/my-properties");
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <EditPropertyForm propertyId={id} />
    </div>
  );
}