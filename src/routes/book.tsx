import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Info,
  ShieldAlert,
  Mail,
  Lock,
  User,
  FileText,
  IdCard,
  MessageCircle,
} from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { BillInvoiceModal } from "@/components/site/BillInvoiceModal";
import { BRAND, PROPERTIES, ROOMS, type PropertyKey } from "@/lib/site-data";
import { useBookingStore, type CreateBookingInput } from "@/lib/booking-store";
import {
  createDirectReservation,
  getBookingAvailability,
} from "@/lib/booking-api";

function isPropertyKey(value: unknown): value is PropertyKey {
  return typeof value === "string" && value in PROPERTIES;
}

type Search = {
  property?: PropertyKey;
  checkIn?: string;
  checkOut?: string;
  adults?: number;
  children?: number;
  rooms?: number;
  room?: string;
};

type Availability = {
  roomTypeSlug: string;
  availableCount: number;
  availableRoomIds: string[];
};

export const Route = createFileRoute("/book")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    property: isPropertyKey(s.property) ? s.property : undefined,
    checkIn: typeof s.checkIn === "string" ? s.checkIn : undefined,
    checkOut: typeof s.checkOut === "string" ? s.checkOut : undefined,
    adults: typeof s.adults === "number" ? s.adults : undefined,
    children: typeof s.children === "number" ? s.children : undefined,
    rooms: typeof s.rooms === "number" ? s.rooms : undefined,
    room: typeof s.room === "string" ? s.room : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Book Your Stay — VANASURU" },
      {
        name: "description",
        content: "Check room availability and reserve your stay at VANASURU via WhatsApp or Email.",
      },
      { property: "og:title", content: "Book Your Stay — VANASURU" },
      { property: "og:description", content: "Check availability and reserve your stay." },
    ],
  }),
  component: BookPage,
});

type BookingFormState = {
  property: PropertyKey;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  rooms: number;
  roomType: string;
  roomId: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  idProofType: string;
  idProofNumber: string;
  idProofImage: string;
  arrivalTime: string;
  purpose: string;
  requests: string;
  terms: boolean;
};

function BookPage() {
  const search = Route.useSearch();
  const { currentUser, login, register, recordVerifiedBooking, rooms, bookings } = useBookingStore();
  const fetchAvailability = useServerFn(getBookingAvailability);
  const createReservation = useServerFn(createDirectReservation);

  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [bookingId, setBookingId] = useState("");
  const [showBillModal, setShowBillModal] = useState(false);
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);
  const [bookingError, setBookingError] = useState("");

  const defaultDates = useMemo(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const checkout = new Date(tomorrow);
    checkout.setDate(checkout.getDate() + 2);
    return {
      checkIn: tomorrow.toISOString().split("T")[0],
      checkOut: checkout.toISOString().split("T")[0],
    };
  }, []);

  const [form, setForm] = useState<BookingFormState>({
    property: search.property ?? "mysore",
    checkIn: search.checkIn || defaultDates.checkIn,
    checkOut: search.checkOut || defaultDates.checkOut,
    adults: search.adults ?? 2,
    children: search.children ?? 0,
    rooms: search.rooms ?? 1,
    roomType: search.room ?? ROOMS[0]?.slug ?? "deluxe-room",
    roomId: "",
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
    idProofType: "Aadhaar Card",
    idProofNumber: "",
    idProofImage: "",
    arrivalTime: "",
    purpose: "Leisure",
    requests: "",
    terms: false,
  });

  const handleIdImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm((f) => ({ ...f, idProofImage: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };



  const [isRegisterTab, setIsRegisterTab] = useState(false);
  const [authName, setAuthName] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState("");

  const set = useCallback(<K extends keyof BookingFormState>(k: K, v: BookingFormState[K]) => {
    setBookingError("");
    setForm((f) => ({ ...f, [k]: v }));
  }, []);

  const isDateRangeSelected = form.checkIn !== "" && form.checkOut !== "";
  const availableRoomSlugs = useMemo(() => availability.map((a) => a.roomTypeSlug), [availability]);
  const availableRoomTypes = ROOMS.filter(
    (room) => !isDateRangeSelected || availableRoomSlugs.includes(room.slug),
  );

  useEffect(() => {
    let ignore = false;

    async function runAvailabilityCheck() {
      setIsCheckingAvailability(true);
      setBookingError("");
      try {
        const result = await fetchAvailability({
          data: { property: form.property, checkIn: form.checkIn, checkOut: form.checkOut },
        });
        if (!ignore) setAvailability(result);
      } catch (error) {
        if (!ignore) {
          setAvailability([]);
          setBookingError(error instanceof Error ? error.message : "Unable to check availability.");
        }
      } finally {
        if (!ignore) setIsCheckingAvailability(false);
      }
    }

    void runAvailabilityCheck();
    return () => {
      ignore = true;
    };
  }, [fetchAvailability, form.checkIn, form.checkOut, form.property]);

  const selectedRoomTypeAvailability = useMemo(() => {
    return availability.find((a) => a.roomTypeSlug === form.roomType);
  }, [availability, form.roomType]);

  const availableRoomIds = useMemo(() => {
    return selectedRoomTypeAvailability?.availableRoomIds ?? [];
  }, [selectedRoomTypeAvailability]);

  useEffect(() => {
    if (
      isDateRangeSelected &&
      availableRoomSlugs.length > 0 &&
      !availableRoomSlugs.includes(form.roomType)
    ) {
      set("roomType", availableRoomSlugs[0]);
    }
  }, [availableRoomSlugs, form.roomType, isDateRangeSelected, set]);

  useEffect(() => {
    if (availableRoomIds.length > 0) {
      if (!availableRoomIds.includes(form.roomId)) {
        set("roomId", availableRoomIds[0]);
      }
    } else if (form.roomId !== "") {
      set("roomId", "");
    }
  }, [availableRoomIds, form.roomId, set]);

  useEffect(() => {
    if (currentUser) {
      const parts = currentUser.name.split(" ");
      setForm((f) => ({
        ...f,
        firstName: f.firstName || parts[0] || "",
        lastName: f.lastName || parts.slice(1).join(" ") || "",
        email: f.email || currentUser.email,
      }));
    }
  }, [currentUser]);

  const buildBookingInput = (): CreateBookingInput => ({
    property: form.property,
    roomTypeSlug: form.roomType,
    roomId: form.roomId || undefined,
    checkIn: form.checkIn,
    checkOut: form.checkOut,
    adults: form.adults,
    children: form.children,
    roomsCount: form.rooms,
    guestDetails: {
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      mobile: form.mobile,
      address: form.address,
      city: form.city,
      state: form.state,
      pincode: form.pincode,
      country: form.country,
      idProofType: form.idProofType,
      idProofNumber: form.idProofNumber,
      idProofImage: form.idProofImage || undefined,
    },
  });

  const handleInlineAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    if (isRegisterTab) {
      if (!authName.trim()) {
        setAuthError("Name is required");
        return;
      }
      const res = await register(authName, authEmail, authPassword);
      if (!res.success) setAuthError(res.error || "Registration failed");
    } else {
      const res = await login(authEmail, authPassword);
      if (!res.success) setAuthError(res.error || "Invalid credentials");
    }
  };

  const isFullyBooked =
    isDateRangeSelected && !isCheckingAvailability && availableRoomSlugs.length === 0;

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingError("");

    if (step === 0) {
      if (!isDateRangeSelected || isFullyBooked) return;
      setStep(1);
      return;
    }
    if (step === 1) {
      setStep(2);
      return;
    }
    if (!currentUser) {
      setBookingError("Please sign in or enter your details before confirming your reservation.");
      setStep(1);
      return;
    }

    await handleCompleteBooking("whatsapp");
  };

  const handleCompleteBooking = async (channel: "whatsapp" | "email") => {
    setBookingError("");

    if (!currentUser) {
      setBookingError("Please sign in or enter your details before confirming your reservation.");
      setStep(1);
      return;
    }

    if (!form.terms) {
      setBookingError("Please accept the booking terms to proceed.");
      return;
    }

    setIsSubmittingBooking(true);
    try {
      const bookingInput = buildBookingInput();
      const result = await createReservation({
        data: {
          booking: bookingInput,
          user: currentUser,
          channel,
        },
      });

      recordVerifiedBooking(result.booking);
      setBookingId(result.booking.id);

      const propInfo = PROPERTIES[form.property] || PROPERTIES["mysore"];
      const roomInfo = ROOMS.find((r) => r.slug === form.roomType);
      const roomName = roomInfo?.name || form.roomType;

      const messageText =
        `Hello VANASURU Retreats,\n\n` +
        `I would like to confirm my booking with the following details:\n` +
        `• Booking ID: ${result.booking.id}\n` +
        `• Property: ${propInfo.name}\n` +
        `• Room: ${roomName}\n` +
        `• Check-In: ${form.checkIn}\n` +
        `• Check-Out: ${form.checkOut}\n` +
        `• Guests: ${form.adults} Adult(s)${form.children > 0 ? `, ${form.children} Child(ren)` : ""}\n` +
        `• Guest Name: ${form.firstName} ${form.lastName}\n` +
        `• Mobile: ${form.mobile}\n` +
        `• Email: ${form.email}\n` +
        (form.requests ? `• Special Requests: ${form.requests}\n` : "") +
        `\nPlease confirm our reservation. Thank you!`;

      if (channel === "whatsapp") {
        const waUrl = `https://wa.me/${BRAND.phoneWhatsapp}?text=${encodeURIComponent(messageText)}`;
        window.open(waUrl, "_blank");
      } else {
        const mailtoUrl = `mailto:vanasurumys@gmail.com?subject=${encodeURIComponent(
          `Reservation Request - ${result.booking.id} - ${form.firstName} ${form.lastName}`
        )}&body=${encodeURIComponent(messageText)}`;
        window.location.href = mailtoUrl;
      }

      setSubmitted(true);
    } catch (error) {
      setBookingError(
        error instanceof Error ? error.message : "Reservation failed. Please try again.",
      );
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  const steps = ["Stay Details", "Guest Details", "Confirm Reservation"];

  if (submitted) {
    const confirmedBooking = bookings.find((b) => b.id === bookingId) || null;
    const propInfo = PROPERTIES[form.property] || PROPERTIES["mysore"];
    const roomInfo = ROOMS.find((r) => r.slug === form.roomType);
    const roomName = roomInfo?.name || form.roomType;

    const followUpMessage =
      `Hello VANASURU Retreats,\n\n` +
      `I have submitted reservation request (ID: ${bookingId || "confirmed"}):\n` +
      `• Property: ${propInfo.name}\n` +
      `• Room: ${roomName}\n` +
      `• Dates: ${form.checkIn} to ${form.checkOut}\n` +
      `• Guest: ${form.firstName} ${form.lastName} (${form.mobile})\n\n` +
      `Please confirm my booking. Thank you!`;

    const waFollowUpUrl = `https://wa.me/${BRAND.phoneWhatsapp}?text=${encodeURIComponent(followUpMessage)}`;
    const emailFollowUpUrl = `mailto:vanasurumys@gmail.com?subject=${encodeURIComponent(
      `Booking Follow-up - ${bookingId || "Reservation"} - ${form.firstName} ${form.lastName}`
    )}&body=${encodeURIComponent(followUpMessage)}`;

    return (
      <SiteShell transparentHeader={false}>
        <div className="pt-32 pb-24 px-6">
          <div className="mx-auto max-w-2xl bg-card border border-[color:var(--gold)]/40 p-10 md:p-14 text-center space-y-6">
            <CheckCircle2 className="mx-auto text-emerald-700" size={60} />
            <h1 className="font-serif text-4xl text-[color:var(--forest)]">
              Reservation Received!
            </h1>
            <p className="text-charcoal/70 leading-relaxed text-sm">
              Your room reservation has been registered with our retreat desk. Your booking ID is{" "}
              <span className="font-mono font-bold text-[color:var(--forest)]">{bookingId || "confirmed"}</span>.
            </p>
            <p className="text-xs text-charcoal/60 bg-[color:var(--sand)]/40 p-3 rounded">
              <strong>Offline Payment Notice:</strong> No online payment was charged. You can settle your bill directly at the resort upon check-in via Cash, UPI, or Card.
            </p>

            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 text-xs flex items-center justify-center gap-2">
              <Mail size={16} className="text-emerald-700 shrink-0" />
              <span>
                Confirmation details &amp; tax invoice sent to{" "}
                <strong className="text-emerald-800">{form.email || currentUser?.email}</strong>.
              </span>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href={waFollowUpUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba59] text-white px-6 py-3.5 text-[11px] font-bold tracking-[0.2em] uppercase transition-colors rounded-sm shadow-md"
              >
                <MessageCircle size={16} /> Chat on WhatsApp
              </a>
              <a
                href={emailFollowUpUrl}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[color:var(--forest)] hover:bg-[color:var(--forest-deep)] text-white px-6 py-3.5 text-[11px] font-bold tracking-[0.2em] uppercase transition-colors rounded-sm shadow-md"
              >
                <Mail size={16} /> Email Retreat Desk
              </a>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 pt-2 border-t border-border/40">
              <button
                type="button"
                onClick={() => setShowBillModal(true)}
                className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-6 py-3.5 text-[11px] font-semibold tracking-[0.24em] uppercase transition-colors rounded-sm cursor-pointer shadow-md"
              >
                <FileText size={16} /> View / Print Bill &amp; Invoice
              </button>

              <Link
                to="/admin"
                className="inline-block border border-border text-[color:var(--forest)] px-6 py-3.5 text-[11px] font-semibold tracking-[0.24em] uppercase hover:bg-[color:var(--sand)]/50 transition-colors"
              >
                View Your Dashboard
              </Link>
            </div>
          </div>
        </div>

        <BillInvoiceModal
          booking={confirmedBooking}
          isOpen={showBillModal}
          onClose={() => setShowBillModal(false)}
        />
      </SiteShell>
    );
  }

  return (
    <SiteShell transparentHeader={false}>
      <div className="pt-32 pb-24 px-6">
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <div className="text-eyebrow">
              <span className="gold-divider mr-3" />
              Book Your Stay
              <span className="gold-divider ml-3" />
            </div>
            <h1 className="mt-5 font-serif text-4xl md:text-5xl text-[color:var(--forest)]">
              Check dates, then reserve via WhatsApp or Email.
            </h1>
          </div>

          <div className="mt-14 flex justify-center gap-4 sm:gap-8 border-b border-border/40 pb-6">
            {steps.map((s, i) => (
              <div key={s} className="flex items-center gap-3">
                <span
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                    i <= step
                      ? "bg-[color:var(--gold)] text-[color:var(--forest-deep)]"
                      : "bg-[color:var(--sand)] text-charcoal/50"
                  }`}
                >
                  {i + 1}
                </span>
                <span
                  className={`text-[11px] tracking-[0.24em] uppercase hidden sm:inline ${i === step ? "text-[color:var(--forest)] font-semibold" : "text-charcoal/50"}`}
                >
                  {s}
                </span>
                {i < steps.length - 1 && <span className="w-8 h-px bg-border" />}
              </div>
            ))}
          </div>

          {bookingError && (
            <div className="mt-8 p-5 bg-destructive/10 border border-destructive/20 text-destructive text-sm flex gap-3 items-start">
              <ShieldAlert size={20} className="shrink-0 mt-0.5" />
              <span>{bookingError}</span>
            </div>
          )}

          {isFullyBooked && step === 0 && (
            <div className="mt-8 p-6 bg-destructive/10 border border-destructive/20 text-destructive text-sm flex gap-4 items-center">
              <ShieldAlert size={24} className="shrink-0" />
              <div>
                <div className="font-bold uppercase tracking-wider text-[11px]">Fully Booked</div>
                <div className="mt-1 text-xs opacity-90">
                  The backend found no rooms at this resort for those dates. Please select other
                  dates or explore our sister property.
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 bg-card border border-border/60 p-8 md:p-12 shadow-lg relative">
            {step === 0 && (
              <form onSubmit={handleFormSubmit} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <Field label="Property">
                    <select
                      required
                      value={form.property}
                      onChange={(e) => {
                        if (isPropertyKey(e.target.value)) set("property", e.target.value);
                      }}
                      className={inp}
                    >
                      {Object.values(PROPERTIES).map((p) => (
                        <option key={p.key} value={p.key}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Preferred Room Type">
                    <select
                      required
                      value={form.roomType}
                      onChange={(e) => set("roomType", e.target.value)}
                      className={inp}
                      disabled={isFullyBooked || isCheckingAvailability}
                    >
                      {availableRoomTypes.map((room) => {
                        const countInfo = availability.find(
                          (item) => item.roomTypeSlug === room.slug,
                        );
                        const countText =
                          countInfo && isDateRangeSelected
                            ? ` (${countInfo.availableCount} available)`
                            : "";
                        return (
                          <option key={room.slug} value={room.slug}>
                            {room.name}
                            {countText}
                          </option>
                        );
                      })}
                    </select>
                  </Field>
                  {isDateRangeSelected &&
                    !isCheckingAvailability &&
                    availableRoomIds.length > 0 && (
                      <Field label="Select Specific Room">
                        <select
                          required
                          value={form.roomId}
                          onChange={(e) => set("roomId", e.target.value)}
                          className={inp}
                        >
                          {availableRoomIds.map((id) => {
                            const roomObj = rooms.find((r) => r.id === id);
                            return (
                              <option key={id} value={id}>
                                {roomObj ? `${roomObj.name}` : id}
                              </option>
                            );
                          })}
                        </select>
                      </Field>
                    )}
                  <Field label="Check In">
                    <input
                      required
                      type="date"
                      value={form.checkIn}
                      onChange={(e) => set("checkIn", e.target.value)}
                      className={inp}
                    />
                  </Field>
                  <Field label="Check Out">
                    <input
                      required
                      type="date"
                      value={form.checkOut}
                      onChange={(e) => set("checkOut", e.target.value)}
                      className={inp}
                    />
                  </Field>
                  <Field label="Adults">
                    <input
                      required
                      type="number"
                      min={1}
                      value={form.adults}
                      onChange={(e) => set("adults", +e.target.value)}
                      className={inp}
                    />
                  </Field>
                  <Field label="Children">
                    <input
                      type="number"
                      min={0}
                      value={form.children}
                      onChange={(e) => set("children", +e.target.value)}
                      className={inp}
                    />
                  </Field>
                  <Field label="Rooms">
                    <input
                      required
                      type="number"
                      min={1}
                      max={1}
                      value={form.rooms}
                      onChange={(e) => set("rooms", +e.target.value)}
                      className={inp}
                      disabled
                      title="Standard booking is 1 room per transaction"
                    />
                  </Field>
                </div>

                <div className="rounded-sm border border-[color:var(--gold)]/20 bg-[color:var(--sand)]/20 p-4 text-xs text-charcoal/70 flex items-start gap-3">
                  <Info size={16} className="text-[color:var(--gold)] shrink-0 mt-0.5" />
                  <span>
                    {isCheckingAvailability
                      ? "Checking room availability with the backend..."
                      : isDateRangeSelected
                        ? "Availability is checked server-side before payment."
                        : "Enter check-in and check-out dates to check available rooms."}
                  </span>
                </div>

                <div className="mt-10 flex justify-end">
                  <button
                    type="submit"
                    disabled={!isDateRangeSelected || isFullyBooked || isCheckingAvailability}
                    className="inline-flex items-center gap-2 px-8 py-3.5 text-[11px] tracking-[0.28em] uppercase font-semibold bg-[color:var(--forest)] text-ivory hover:bg-[color:var(--gold)] hover:text-[color:var(--forest-deep)] disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    Continue <ChevronRight size={16} />
                  </button>
                </div>
              </form>
            )}

            {step === 1 && !currentUser && (
              <div className="max-w-md mx-auto py-4">
                <div className="text-center mb-8">
                  <h3 className="font-serif text-2xl text-[color:var(--forest)]">
                    Sign In Required
                  </h3>
                  <p className="text-xs text-charcoal/60 mt-1">
                    Please sign in or register before paying the booking advance.
                  </p>
                </div>

                {authError && (
                  <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 text-destructive text-xs flex gap-2 items-center">
                    <ShieldAlert size={16} />
                    <span>{authError}</span>
                  </div>
                )}

                <form onSubmit={handleInlineAuth} className="space-y-4">
                  {isRegisterTab && (
                    <label className="block">
                      <div className="text-[9px] tracking-[0.2em] uppercase text-charcoal/60 flex items-center gap-1.5">
                        <User size={10} className="text-gold" /> Full Name
                      </div>
                      <input
                        required
                        type="text"
                        placeholder="Jane Doe"
                        value={authName}
                        onChange={(e) => setAuthName(e.target.value)}
                        className={inp}
                      />
                    </label>
                  )}
                  <label className="block">
                    <div className="text-[9px] tracking-[0.2em] uppercase text-charcoal/60 flex items-center gap-1.5">
                      <Mail size={10} className="text-gold" /> Email Address
                    </div>
                    <input
                      required
                      type="email"
                      placeholder="you@example.com"
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      className={inp}
                    />
                  </label>
                  <label className="block">
                    <div className="text-[9px] tracking-[0.2em] uppercase text-charcoal/60 flex items-center gap-1.5">
                      <Lock size={10} className="text-gold" /> Password
                    </div>
                    <input
                      required
                      type="password"
                      placeholder="Password"
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      className={inp}
                    />
                  </label>
                  <button
                    type="submit"
                    className="w-full mt-2 bg-[color:var(--forest)] hover:bg-[color:var(--gold)] hover:text-[color:var(--forest-deep)] text-ivory py-3.5 text-[11px] font-semibold tracking-[0.28em] uppercase transition-colors"
                  >
                    {isRegisterTab ? "Register" : "Sign In"}
                  </button>
                </form>

                <div className="mt-6 text-center text-xs text-charcoal/60">
                  {isRegisterTab ? (
                    <span>
                      Already have an account?{" "}
                      <button
                        type="button"
                        onClick={() => {
                          setIsRegisterTab(false);
                          setAuthError("");
                        }}
                        className="text-[color:var(--gold)] font-bold hover:underline"
                      >
                        Sign In
                      </button>
                    </span>
                  ) : (
                    <span>
                      Do not have an account?{" "}
                      <button
                        type="button"
                        onClick={() => {
                          setIsRegisterTab(true);
                          setAuthError("");
                        }}
                        className="text-[color:var(--gold)] font-bold hover:underline"
                      >
                        Create Account
                      </button>
                    </span>
                  )}
                </div>

                <div className="mt-10 flex justify-start">
                  <button
                    type="button"
                    onClick={() => setStep(0)}
                    className="inline-flex items-center gap-2 px-6 py-3 text-[11px] tracking-[0.28em] uppercase font-semibold border border-border text-[color:var(--forest)] hover:border-[color:var(--gold)] cursor-pointer"
                  >
                    <ChevronLeft size={16} /> Back
                  </button>
                </div>
              </div>
            )}

            {step === 1 && currentUser && (
              <form onSubmit={handleFormSubmit} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <Field label="First Name">
                    <input
                      required
                      value={form.firstName}
                      onChange={(e) => set("firstName", e.target.value)}
                      className={inp}
                    />
                  </Field>
                  <Field label="Last Name">
                    <input
                      required
                      value={form.lastName}
                      onChange={(e) => set("lastName", e.target.value)}
                      className={inp}
                    />
                  </Field>
                  <Field label="Email">
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={(e) => set("email", e.target.value)}
                      className={inp}
                    />
                  </Field>
                  <Field label="Mobile">
                    <input
                      required
                      type="tel"
                      value={form.mobile}
                      onChange={(e) => set("mobile", e.target.value)}
                      className={inp}
                    />
                  </Field>
                  <Field label="Full Address" className="md:col-span-2">
                    <input
                      required
                      value={form.address}
                      onChange={(e) => set("address", e.target.value)}
                      className={inp}
                    />
                  </Field>
                  <Field label="City">
                    <input
                      required
                      value={form.city}
                      onChange={(e) => set("city", e.target.value)}
                      className={inp}
                    />
                  </Field>
                  <Field label="State">
                    <input
                      required
                      value={form.state}
                      onChange={(e) => set("state", e.target.value)}
                      className={inp}
                    />
                  </Field>
                  <Field label="Pincode">
                    <input
                      required
                      value={form.pincode}
                      onChange={(e) => set("pincode", e.target.value)}
                      className={inp}
                    />
                  </Field>
                  <Field label="Country">
                    <input
                      required
                      value={form.country}
                      onChange={(e) => set("country", e.target.value)}
                      className={inp}
                    />
                  </Field>
                  <Field label="ID Proof Type *">
                    <select
                      required
                      value={form.idProofType}
                      onChange={(e) => set("idProofType", e.target.value)}
                      className={inp}
                    >
                      <option value="Aadhaar Card">Aadhaar Card</option>
                      <option value="Passport">Passport</option>
                      <option value="Driving License">Driving License</option>
                      <option value="Voter ID">Voter ID</option>
                      <option value="PAN Card">PAN Card</option>
                      <option value="Govt Photo ID">Govt Photo ID</option>
                    </select>
                  </Field>
                  <Field label="ID Proof Number *">
                    <input
                      required
                      placeholder="e.g. 1234 5678 9012"
                      value={form.idProofNumber}
                      onChange={(e) => set("idProofNumber", e.target.value)}
                      className={inp}
                    />
                  </Field>
                  <Field label="ID Proof Image (Optional)" className="md:col-span-2">
                    <div className="flex items-center gap-4 mt-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleIdImageUpload}
                        className="bg-transparent border border-border text-xs py-2 px-3 focus:outline-none w-full"
                      />
                      {form.idProofImage && (
                        <img
                          src={form.idProofImage}
                          alt="ID Preview"
                          className="w-12 h-12 object-cover rounded border border-[color:var(--gold)]"
                        />
                      )}
                    </div>
                  </Field>
                </div>
                <div className="mt-10 flex justify-between gap-4">
                  <button
                    type="button"
                    onClick={() => setStep(0)}
                    className="inline-flex items-center gap-2 px-6 py-3 text-[11px] tracking-[0.28em] uppercase font-semibold border border-border text-[color:var(--forest)] hover:border-[color:var(--gold)] cursor-pointer"
                  >
                    <ChevronLeft size={16} /> Back
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-8 py-3.5 text-[11px] tracking-[0.28em] uppercase font-semibold bg-[color:var(--forest)] text-ivory hover:bg-[color:var(--gold)] hover:text-[color:var(--forest-deep)] transition-colors"
                  >
                    Continue <ChevronRight size={16} />
                  </button>
                </div>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleFormSubmit} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <Field label="Expected Arrival Time">
                    <input
                      type="time"
                      value={form.arrivalTime}
                      onChange={(e) => set("arrivalTime", e.target.value)}
                      className={inp}
                    />
                  </Field>
                  <Field label="Purpose of Stay">
                    <select
                      value={form.purpose}
                      onChange={(e) => set("purpose", e.target.value)}
                      className={inp}
                    >
                      <option>Leisure</option>
                      <option>Business</option>
                      <option>Wedding</option>
                      <option>Event</option>
                    </select>
                  </Field>
                  <Field label="Special Requests" className="md:col-span-2">
                    <textarea
                      rows={4}
                      value={form.requests}
                      onChange={(e) => set("requests", e.target.value)}
                      className={inp}
                      placeholder="Dietary restrictions, bedding configurations, or details about the celebration..."
                    />
                  </Field>
                  <div className="md:col-span-2 rounded-sm border border-emerald-600/30 bg-emerald-50/50 p-6 text-sm text-charcoal/80 space-y-4">
                    <div className="flex items-center gap-2 text-emerald-900 font-serif text-xl font-bold">
                      <CheckCircle2 size={22} className="text-emerald-700" />
                      Direct Reservation (No Online Payment Required)
                    </div>
                    <p className="text-xs leading-relaxed text-charcoal/75">
                      No online payment or credit card is required to reserve. Your booking request will be registered directly with the retreat front desk, and you can settle your bill upon arrival via Cash, UPI, or Card.
                    </p>
                    <div className="bg-white/90 p-4 rounded border border-emerald-200/80 text-xs grid grid-cols-1 sm:grid-cols-2 gap-3 text-charcoal/80">
                      <div><strong className="text-emerald-950">Property:</strong> {PROPERTIES[form.property]?.name || form.property}</div>
                      <div><strong className="text-emerald-950">Room Type:</strong> {ROOMS.find(r => r.slug === form.roomType)?.name || form.roomType}</div>
                      <div><strong className="text-emerald-950">Dates:</strong> {form.checkIn} → {form.checkOut}</div>
                      <div><strong className="text-emerald-950">Guests:</strong> {form.adults} Adult(s){form.children ? `, ${form.children} Child(ren)` : ""}</div>
                    </div>
                  </div>
                  <label className="md:col-span-2 flex items-start gap-3 text-sm text-charcoal/80 cursor-pointer">
                    <input
                      required
                      type="checkbox"
                      checked={form.terms}
                      onChange={(e) => set("terms", e.target.checked)}
                      className="mt-1 accent-[color:var(--gold)] cursor-pointer"
                    />
                    <span className="text-xs">
                      I agree to the booking terms and confirm this reservation request for VANASURU Retreats.
                    </span>
                  </label>
                </div>
                <div className="mt-10 flex flex-col sm:flex-row justify-between items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    disabled={isSubmittingBooking}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-[11px] tracking-[0.28em] uppercase font-semibold border border-border text-[color:var(--forest)] hover:border-[color:var(--gold)] cursor-pointer disabled:opacity-50"
                  >
                    <ChevronLeft size={16} /> Back
                  </button>
                  <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-3">
                    <button
                      type="button"
                      onClick={() => handleCompleteBooking("whatsapp")}
                      disabled={isSubmittingBooking || !form.terms}
                      className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-[11px] tracking-[0.24em] uppercase font-bold bg-[#25D366] hover:bg-[#20ba59] text-white shadow-md disabled:bg-gray-300 disabled:cursor-not-allowed transition-all cursor-pointer"
                    >
                      <MessageCircle size={16} />
                      {isSubmittingBooking ? "Reserving..." : "Confirm via WhatsApp"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCompleteBooking("email")}
                      disabled={isSubmittingBooking || !form.terms}
                      className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-[11px] tracking-[0.24em] uppercase font-bold bg-[color:var(--forest)] hover:bg-[color:var(--gold)] text-ivory hover:text-[color:var(--forest-deep)] shadow-md disabled:bg-gray-300 disabled:cursor-not-allowed transition-all cursor-pointer"
                    >
                      <Mail size={16} />
                      {isSubmittingBooking ? "Reserving..." : "Confirm via Email"}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </SiteShell>
  );
}

const inp =
  "mt-2 w-full bg-transparent border border-border focus:border-[color:var(--gold)] focus:outline-none px-4 py-3 text-sm";

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <div className="text-[10px] tracking-[0.28em] uppercase text-charcoal/60">{label}</div>
      {children}
    </label>
  );
}
