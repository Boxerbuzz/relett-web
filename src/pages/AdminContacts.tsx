import { useState, useEffect } from "react";
import { InputValidator } from "@/lib/security/inputValidation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { LoadingSpinner } from "@/components/loading/LoadingSpinner";
import {
  EnvelopeIcon,
  PhoneIcon,
  EyeIcon,
  ArrowLeftIcon,
} from "@phosphor-icons/react";
import { Link } from "react-router-dom";

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  message: string;
  created_at: string;
  status?: string;
  responded_at?: string;
  response_method?: string;
  response_notes?: string;
}

export default function AdminContacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [responseMethod, setResponseMethod] = useState<"email" | "sms">(
    "email"
  );
  const [responseMessage, setResponseMessage] = useState("");
  const [responding, setResponding] = useState(false);
  const { toast } = useToast();

  const itemsPerPage = 10;

  useEffect(() => {
    fetchContacts();
  }, [currentPage]);

  const fetchContacts = async () => {
    try {
      setLoading(true);

      // Get total count
      const { count } = await supabase
        .from("contacts_us")
        .select("*", { count: "exact", head: true });

      setTotalPages(Math.ceil((count || 0) / itemsPerPage));

      // Get paginated data
      const { data, error } = await supabase
        .from("contacts_us")
        .select("*")
        .order("created_at", { ascending: false })
        .range(
          (currentPage - 1) * itemsPerPage,
          currentPage * itemsPerPage - 1
        );

      if (error) throw error;
      setContacts((data as Contact[]) || []);
    } catch (error) {
      console.error("Error fetching contacts:", error);
      toast({
        title: "Error",
        description: "Failed to fetch contacts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResponse = async () => {
    if (!selectedContact || !responseMessage.trim()) return;

    try {
      setResponding(true);

      if (responseMethod === "email") {
        // Send email via edge function
        const { error } = await supabase.functions.invoke("send-email", {
          body: {
            to: selectedContact.email,
            template: "admin-response",
            data: {
              name: `${selectedContact.first_name} ${selectedContact.last_name}`,
              message: responseMessage,
              originalMessage: selectedContact.message,
            },
          },
        });

        if (error) throw error;
      } else {
        // Send SMS via edge function
        const { error } = await supabase.functions.invoke(
          "send-sms-notification",
          {
            body: {
              to: selectedContact.phone_number,
              message: responseMessage,
            },
          }
        );

        if (error) throw error;
      }

      // Update contact record
      const { error: updateError } = await supabase
        .from("contacts_us")
        .update({})
        .eq("id", selectedContact.id);

      if (updateError) throw updateError;

      toast({
        title: "Response sent",
        description: `Successfully sent ${responseMethod} response`,
      });

      setSelectedContact(null);
      setResponseMessage("");
      fetchContacts();
    } catch (error) {
      console.error("Error sending response:", error);
      toast({
        title: "Error",
        description: `Failed to send ${responseMethod} response`,
        variant: "destructive",
      });
    } finally {
      setResponding(false);
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "responded":
        return <Badge className="bg-green-100 text-green-800">Responded</Badge>;
      case "read":
        return <Badge className="bg-blue-100 text-blue-800">Read</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unread</Badge>;
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading contacts..." />;
  }

  return (
    <div className="space-y-6">
      <div className="spacing-y-4">
        <Link to="/admin">
          <Button
            variant="ghost"
            size="sm"
            className="w-fit bg-gray-100 hover:bg-gray-200"
          >
            <ArrowLeftIcon size={16} className="mr-2" />
            Back
          </Button>
        </Link>
        <div className="mt-4">
          <h1 className="text-2xl font-bold">Contact Us Management</h1>
          <p className="text-gray-600">Manage and respond to user inquiries</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Contact Messages</CardTitle>
          <CardDescription>
            All contact form submissions with response options
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="md:table-cell">Name</TableHead>
                  <TableHead className="min-w-[180px]">Contact</TableHead>
                  <TableHead className="hidden lg:table-cell">Status</TableHead>
                  <TableHead className="hidden md:table-cell">Date</TableHead>
                  <TableHead className="w-[100px] md:w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contacts.map((contact) => (
                  <TableRow key={contact.id} className="hover:bg-gray-50">
                    <TableCell className="py-3">
                      <div className="font-medium">
                        {contact.first_name} {contact.last_name}
                      </div>
                      <div className="text-xs text-gray-500 lg:hidden mt-1">
                        {getStatusBadge(contact.status)}
                      </div>
                      <div className="text-xs text-gray-500 md:hidden">
                        {new Date(contact.created_at).toLocaleDateString(
                          "en-US",
                          { month: "short", day: "numeric" }
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="flex items-center gap-1.5 text-sm">
                        <EnvelopeIcon
                          size={14}
                          className="text-gray-400 flex-shrink-0"
                        />
                        <a
                          href={`mailto:${contact.email}`}
                          className="truncate hover:underline"
                        >
                          {contact.email}
                        </a>
                      </div>
                      {contact.phone_number && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
                          <PhoneIcon
                            size={12}
                            className="text-gray-400 flex-shrink-0"
                          />
                          <a
                            href={`tel:${contact.phone_number.replace(
                              /[^\d+]/g,
                              ""
                            )}`}
                            className="truncate hover:underline"
                          >
                            {contact.phone_number}
                          </a>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {getStatusBadge(contact.status)}
                    </TableCell>
                    <TableCell className="hidden md:table-cell whitespace-nowrap">
                      {new Date(contact.created_at).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        }
                      )}
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 p-0 hover:bg-gray-100"
                              onClick={() => setSelectedContact(contact)}
                              title="View details"
                            >
                              <EyeIcon size={16} />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>
                                Contact from {contact.first_name}{" "}
                                {contact.last_name}
                              </DialogTitle>
                              <DialogDescription>
                                Submitted on{" "}
                                {new Date(contact.created_at).toLocaleString()}
                              </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4">
                                <div>
                                  <h4 className="font-medium">Message:</h4>
                                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                                    {/* SECURITY: Sanitize displayed content */}
                                    {InputValidator.sanitizeText(contact.message)}
                                  </p>
                                </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-medium">Email:</h4>
                                  <p className="text-sm">{contact.email}</p>
                                </div>
                                <div>
                                  <h4 className="font-medium">Phone:</h4>
                                  <p className="text-sm">
                                    {contact.phone_number || "Not provided"}
                                  </p>
                                </div>
                              </div>

                              {contact.status !== "responded" && (
                                <div className="space-y-4 border-t pt-4">
                                  <h4 className="font-medium">
                                    Send Response:
                                  </h4>

                                  <div className="flex gap-2">
                                    <Select
                                      value={responseMethod}
                                      onValueChange={(value: "email" | "sms") =>
                                        setResponseMethod(value)
                                      }
                                    >
                                      <SelectTrigger className="w-32">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="email">
                                          <div className="flex items-center gap-2">
                                            <EnvelopeIcon size={16} />
                                            Email
                                          </div>
                                        </SelectItem>
                                        {contact.phone_number && (
                                          <SelectItem value="sms">
                                            <div className="flex items-center gap-2">
                                              <PhoneIcon size={16} />
                                              SMS
                                            </div>
                                          </SelectItem>
                                        )}
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  <Textarea
                                    placeholder="Type your response here..."
                                    value={responseMessage}
                                    onChange={(e) => {
                                      // SECURITY: Sanitize input to prevent XSS
                                      const sanitized = InputValidator.sanitizeText(e.target.value);
                                      setResponseMessage(sanitized);
                                    }}
                                    rows={4}
                                  />

                                  <Button
                                    onClick={handleResponse}
                                    disabled={
                                      !responseMessage.trim() || responding
                                    }
                                    className="w-full"
                                  >
                                    {responding ? (
                                      <LoadingSpinner size="sm" />
                                    ) : (
                                      <>
                                        {responseMethod === "email" ? (
                                          <EnvelopeIcon
                                            size={16}
                                            className="mr-2"
                                          />
                                        ) : (
                                          <PhoneIcon
                                            size={16}
                                            className="mr-2"
                                          />
                                        )}
                                        Send{" "}
                                        {responseMethod === "email"
                                          ? "Email"
                                          : "SMS"}{" "}
                                        Response
                                      </>
                                    )}
                                  </Button>
                                </div>
                              )}

                              {contact.status === "responded" && (
                                <div className="bg-green-50 p-3 rounded">
                                  <p className="text-sm text-green-800">
                                    <strong>
                                      Responded via {contact.response_method}{" "}
                                      on:
                                    </strong>
                                    <br />
                                    {contact.responded_at &&
                                      new Date(
                                        contact.responded_at
                                      ).toLocaleString()}
                                  </p>
                                  {contact.response_notes && (
                                    <div className="mt-2">
                                      <strong>Response:</strong>
                                      <p className="text-sm">
                                        {contact.response_notes}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="mt-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() =>
                        setCurrentPage(Math.max(1, currentPage - 1))
                      }
                      className={
                        currentPage === 1
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => setCurrentPage(page)}
                          isActive={currentPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  )}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        setCurrentPage(Math.min(totalPages, currentPage + 1))
                      }
                      className={
                        currentPage === totalPages
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
