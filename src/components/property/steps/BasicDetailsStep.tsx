import { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import CurrencyInput from "@/components/input/CurrencyInput";
import CounterInput from "@/components/input/CounterInput";
import { getPricingGridClass } from "@/utils/gridUtils";

interface BasicDetailsStepProps {
  form: UseFormReturn<any>;
}

export function BasicDetailsStep({ form }: BasicDetailsStepProps) {
  const category = form.watch("category");
  const type = form.watch("type");

  // Define sub-type options based on property type
  const getSubTypeOptions = (propertyType: string) => {
    const subTypeOptions: Record<string, { value: string; label: string }[]> = {
      residential: [
        { value: "apartment", label: "Apartment" },
        { value: "villa", label: "Villa" },
        { value: "house", label: "House" },
        { value: "condo", label: "Condo" },
        { value: "townhouse", label: "Townhouse" },
        { value: "duplex", label: "Duplex" },
        { value: "penthouse", label: "Penthouse" },
        { value: "studio", label: "Studio" },
      ],
      commercial: [
        { value: "office", label: "Office" },
        { value: "retail", label: "Retail" },
        { value: "warehouse", label: "Warehouse" },
        { value: "hotel", label: "Hotel" },
        { value: "restaurant", label: "Restaurant" },
        { value: "shop", label: "Shop" },
        { value: "mall", label: "Mall" },
      ],
      industrial: [
        { value: "factory", label: "Factory" },
        { value: "manufacturing", label: "Manufacturing" },
        { value: "logistics", label: "Logistics" },
        { value: "warehouse", label: "Industrial Warehouse" },
      ],
      land: [
        { value: "residential_land", label: "Residential Land" },
        { value: "commercial_land", label: "Commercial Land" },
        { value: "industrial_land", label: "Industrial Land" },
        { value: "farmland", label: "Farmland" },
        { value: "agricultural", label: "Agricultural Land" },
      ],
    };

    return subTypeOptions[propertyType] || [];
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Basic Property Details</h2>
        <p className="text-gray-600 mb-6">
          Tell us about your property. This information will help potential
          investors understand your listing.
        </p>
      </div>

      <div className={(() => {
        // Property details section - usually has 4-5 fields, so 2 columns work well
        return "grid grid-cols-1 md:grid-cols-2 gap-6";
      })()}>
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>Property Title *</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., Luxury Apartment Complex in Victoria Island"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Property Type *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select property type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="residential">Residential</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                  <SelectItem value="industrial">Industrial</SelectItem>
                  <SelectItem value="land">Land</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="sub_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sub Type *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select sub type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {getSubTypeOptions(type).map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Listing Category *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="sell">For Sale</SelectItem>
                  <SelectItem value="rent">For Rent</SelectItem>
                  <SelectItem value="shortlet">Short Let</SelectItem>
                  <SelectItem value="lease">For Lease</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="condition"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Property Condition *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="newlyBuilt">Newly Built</SelectItem>
                  <SelectItem value="renovated">Recently Renovated</SelectItem>
                  <SelectItem value="good">Good Condition</SelectItem>
                  <SelectItem value="needs_renovation">
                    Needs Renovation
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Price Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Pricing Information</h3>

        <div className={(() => {
          // Calculate visible pricing fields
          const pricingFields = ['price.amount', 'price.term'];
          if (category === "rent" || category === "shortlet" || category === "lease") {
            pricingFields.push('price.deposit');
          }
          return getPricingGridClass(pricingFields);
        })()}>
          <FormField
            control={form.control}
            name="price.amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price Amount (NGN) *</FormLabel>
                <FormControl>
                  <CurrencyInput
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="₦0"
                    min={1000}
                    max={1000000000}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

                  <FormField
          control={form.control}
          name="price.term"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price Term</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select term" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {/* Show all terms for residential and commercial properties */}
                  {(type === "residential" || type === "commercial") && category === "shortlet" && (
                    <SelectItem value="night">Per Night</SelectItem>
                  )}
                  {(type === "residential" || type === "commercial") && (category === "rent" || category === "shortlet") && (
                    <SelectItem value="week">Per Week</SelectItem>
                  )}
                  {type !== "land" && (
                    <SelectItem value="month">Per Month</SelectItem>
                  )}
                  <SelectItem value="year">Per Year</SelectItem>
                  {/* For land and sell category, show total price option */}
                  {(category === "sell" || type === "land") && (
                    <SelectItem value="total">Total Price</SelectItem>
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

          {/* Deposit only for rental properties */}
          {(category === "rent" || category === "shortlet" || category === "lease") && (
            <FormField
              control={form.control}
              name="price.deposit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deposit Amount</FormLabel>
                  <FormControl>
                    <CurrencyInput
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="₦0"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        {/* Additional pricing fields - show based on category and type */}
        <div className={(() => {
          // Calculate visible additional pricing fields
          const additionalFields = [];
          if (category === "rent" || category === "shortlet") {
            additionalFields.push('service_charge');
          }
          additionalFields.push('is_negotiable'); // Always shown
          
          return additionalFields.length === 1 
            ? "grid grid-cols-1 gap-4" 
            : "grid grid-cols-1 md:grid-cols-2 gap-4";
        })()}>
          {/* Service charge only for rental properties */}
          {(category === "rent" || category === "shortlet") && (
            <FormField
              control={form.control}
              name="price.service_charge"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service Charge</FormLabel>
                  <FormControl>
                    <CurrencyInput
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="₦0"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="price.is_negotiable"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price Negotiability</FormLabel>
                <div className="border border-gray-300 rounded-md p-4 py-2">
                  <FormField
                    control={form.control}
                    name="price.is_negotiable"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm font-medium">
                            Price is negotiable
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* Additional Settings */}
      {category === "shortlet" && (
        <FormField
          control={form.control}
          name="max_guest"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Maximum Guests</FormLabel>
              <FormControl>
                <CounterInput
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="0"
                  min={0}
                  max={50}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {/* Exclusive Listing Section */}
      <div className="space-y-4">
        <div className="border rounded-lg p-6 bg-blue-50/50">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Exclusive Listing
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Make your property an exclusive listing on Relett. This means
                your property will be exclusively marketed and managed by
                Relett, ensuring maximum visibility and professional handling.
              </p>

              <div className="space-y-3 mb-4">
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm text-gray-700">
                    Priority placement in search results and featured sections
                  </span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm text-gray-700">
                    Dedicated property manager and marketing support
                  </span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm text-gray-700">
                    Professional photography and virtual tours included
                  </span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm text-gray-700">
                    Enhanced verification and trust indicators
                  </span>
                </div>
              </div>

              <FormField
                control={form.control}
                name="is_exclusive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="mt-1"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-base font-medium">
                        Make this an exclusive listing
                      </FormLabel>
                      <p className="text-xs text-gray-500">
                        Your property will be exclusively marketed by Relett
                      </p>
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>
      </div>

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Property Description *</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Describe your property in detail. Include key features, amenities, and what makes it special..."
                className="min-h-32"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
