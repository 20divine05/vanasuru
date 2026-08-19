import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useId } from "react";
import { SiteShell } from "@/components/site/SiteShell";
import { ArrowLeft, Printer, Sparkles, Building2 } from "lucide-react";

export const Route = createFileRoute("/salary-slip")({
  head: () => ({
    meta: [
      { title: "Salary Slip Generator — MA SHRI VENTURES" },
      {
        name: "description",
        content: "Generate and download official monthly employee salary slips for MA SHRI VENTURES PRIVATE LIMITED.",
      },
    ],
  }),
  component: SalarySlipPage,
});

// Helper function to convert number into Indian currency words
function numberToWords(num: number): string {
  if (isNaN(num) || num <= 0) return "Zero Rupees only";

  const a = [
    "", "One ", "Two ", "Three ", "Four ", "Five ", "Six ", "Seven ", "Eight ", "Nine ", "Ten ",
    "Eleven ", "Twelve ", "Thirteen ", "Fourteen ", "Fifteen ", "Sixteen ", "Seventeen ", "Eighteen ", "Nineteen "
  ];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  function inWords(n: number): string {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + a[n % 10] : " ");
    if (n < 1000) return a[Math.floor(n / 100)] + "Hundred " + (n % 100 !== 0 ? "and " + inWords(n % 100) : "");
    if (n < 100000) return inWords(Math.floor(n / 1000)) + "Thousand " + (n % 1000 !== 0 ? inWords(n % 1000) : "");
    if (n < 10000000) return inWords(Math.floor(n / 100000)) + "Lakh " + (n % 100000 !== 0 ? inWords(n % 100000) : "");
    return inWords(Math.floor(n / 10000000)) + "Crore " + (n % 10000000 !== 0 ? inWords(n % 10000000) : "");
  }

  const result = inWords(Math.floor(num)).trim();
  return (result ? result.charAt(0).toUpperCase() + result.slice(1) : "Zero") + " rupees only...";
}

export function SalarySlipGenerator({ showBackLink = true }: { showBackLink?: boolean }) {
  const monthYearId = useId();
  const companyNameId = useId();
  const empIdInputId = useId();
  const empNameId = useId();
  const designationId = useId();
  const departmentId = useId();
  const basicSalaryId = useId();
  const netSalaryId = useId();
  const advanceAmountId = useId();
  const amountWordsId = useId();
  const signedById = useId();
  const approvedById = useId();

  const [monthYear, setMonthYear] = useState("July-2026");
  const [companyName, setCompanyName] = useState("MA SHRI VENTURES PRIVATE LIMITED");
  const [empId, setEmpId] = useState("MSV-102");
  const [empName, setEmpName] = useState("Sri Ganesh Gowda");
  const [designation, setDesignation] = useState("General Manager");
  const [department, setDepartment] = useState("Hospitality & Operations");
  const [basicSalary, setBasicSalary] = useState("14000");
  const [netSalary, setNetSalary] = useState("14000");
  const [advanceAmount, setAdvanceAmount] = useState("0");
  const [amountInWords, setAmountInWords] = useState("Fourteen thousand rupees only...");
  const [signedBy, setSignedBy] = useState("Authorized Signatory");
  const [approvedBy, setApprovedBy] = useState("Sri Ganesh Gowda");

  const handleNetSalaryChange = (val: string) => {
    setNetSalary(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num > 0) {
      setAmountInWords(numberToWords(num));
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full">
      {/* High-Contrast Crisp Print CSS */}
      <style>{`
        @media print {
          @page {
            margin: 10mm;
            size: portrait;
          }
          body * {
            visibility: hidden !important;
          }
          header, footer, nav, .print\\:hidden, button, a {
            display: none !important;
          }
          #printable-salary-slip, #printable-salary-slip * {
            visibility: visible !important;
            color: #000000 !important;
            border-color: #000000 !important;
            background-color: #ffffff !important;
            text-shadow: none !important;
            box-shadow: none !important;
          }
          #printable-salary-slip {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 24px !important;
            border: 2px solid #000000 !important;
            background: #ffffff !important;
          }
          .print-slip-box {
            border: 1.5px solid #000000 !important;
            background: #ffffff !important;
            color: #000000 !important;
            padding: 20px !important;
          }
          .print-bold {
            font-weight: 800 !important;
            color: #000000 !important;
          }
        }
      `}</style>

      {/* Header controls bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-6 mb-8 print:hidden">
        <div>
          {showBackLink && (
            <Link
              to="/admin"
              className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-widest uppercase text-charcoal/60 hover:text-[color:var(--forest)] transition-colors mb-2"
            >
              <ArrowLeft size={14} /> Back to Admin Console
            </Link>
          )}
          <h1 className="font-serif text-3xl md:text-4xl text-[color:var(--forest)] font-bold flex items-center gap-3">
            <Building2 className="text-[color:var(--gold)]" /> Salary Slip Generator
          </h1>
          <p className="text-xs text-charcoal/70 mt-1">
            Enter monthly salary details to generate and print official crisp salary slips for MA SHRI VENTURES PRIVATE LIMITED.
          </p>
        </div>
        <button
          onClick={handlePrint}
          className="bg-[color:var(--forest)] hover:bg-[color:var(--gold)] hover:text-black text-ivory px-6 py-3 text-xs font-semibold tracking-widest uppercase flex items-center gap-2 transition-all shadow-md cursor-pointer shrink-0"
        >
          <Printer size={16} /> Print / Save as PDF
        </button>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: EDITOR CONTROLS (Hidden during print) */}
        <div className="lg:col-span-5 bg-card border border-border/80 p-6 md:p-8 shadow-sm print:hidden space-y-6">
          <div className="flex items-center gap-2 border-b border-border pb-4">
            <Sparkles className="text-[color:var(--gold)]" size={18} />
            <h2 className="font-serif text-lg font-bold text-[color:var(--forest)]">
              Salary Slip Details Editor
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor={monthYearId} className="block text-[10px] tracking-wider uppercase font-bold text-charcoal/70 mb-1">
                Salary Month &amp; Year
              </label>
              <input
                id={monthYearId}
                type="text"
                value={monthYear}
                onChange={(e) => setMonthYear(e.target.value)}
                placeholder="July-2026"
                className="w-full bg-transparent border border-border focus:border-[color:var(--gold)] focus:outline-none px-3 py-2 text-xs font-mono"
              />
            </div>

            <div>
              <label htmlFor={empIdInputId} className="block text-[10px] tracking-wider uppercase font-bold text-charcoal/70 mb-1">
                Employee ID
              </label>
              <input
                id={empIdInputId}
                type="text"
                value={empId}
                onChange={(e) => setEmpId(e.target.value)}
                placeholder="MSV-102"
                className="w-full bg-transparent border border-border focus:border-[color:var(--gold)] focus:outline-none px-3 py-2 text-xs font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor={companyNameId} className="block text-[10px] tracking-wider uppercase font-bold text-charcoal/70 mb-1">
                Company Name
              </label>
              <input
                id={companyNameId}
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="MA SHRI VENTURES PRIVATE LIMITED"
                className="w-full bg-transparent border border-border focus:border-[color:var(--gold)] focus:outline-none px-3 py-2 text-xs font-bold"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor={empNameId} className="block text-[10px] tracking-wider uppercase font-bold text-charcoal/70 mb-1">
                Employee Full Name
              </label>
              <input
                id={empNameId}
                type="text"
                value={empName}
                onChange={(e) => setEmpName(e.target.value)}
                placeholder="Sri Ganesh Gowda"
                className="w-full bg-transparent border border-border focus:border-[color:var(--gold)] focus:outline-none px-3 py-2 text-xs font-semibold"
              />
            </div>

            <div>
              <label htmlFor={designationId} className="block text-[10px] tracking-wider uppercase font-bold text-charcoal/70 mb-1">
                Designation
              </label>
              <input
                id={designationId}
                type="text"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                placeholder="General Manager"
                className="w-full bg-transparent border border-border focus:border-[color:var(--gold)] focus:outline-none px-3 py-2 text-xs"
              />
            </div>

            <div>
              <label htmlFor={departmentId} className="block text-[10px] tracking-wider uppercase font-bold text-charcoal/70 mb-1">
                Department
              </label>
              <input
                id={departmentId}
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="Hospitality & Operations"
                className="w-full bg-transparent border border-border focus:border-[color:var(--gold)] focus:outline-none px-3 py-2 text-xs"
              />
            </div>

            <div>
              <label htmlFor={basicSalaryId} className="block text-[10px] tracking-wider uppercase font-bold text-charcoal/70 mb-1">
                Basic Salary (₹)
              </label>
              <input
                id={basicSalaryId}
                type="number"
                value={basicSalary}
                onChange={(e) => setBasicSalary(e.target.value)}
                placeholder="14000"
                className="w-full bg-transparent border border-border focus:border-[color:var(--gold)] focus:outline-none px-3 py-2 text-xs font-mono font-bold text-emerald-800"
              />
            </div>

            <div>
              <label htmlFor={netSalaryId} className="block text-[10px] tracking-wider uppercase font-bold text-charcoal/70 mb-1">
                Net Salary Amount (₹)
              </label>
              <input
                id={netSalaryId}
                type="number"
                value={netSalary}
                onChange={(e) => handleNetSalaryChange(e.target.value)}
                placeholder="14000"
                className="w-full bg-transparent border border-border focus:border-[color:var(--gold)] focus:outline-none px-3 py-2 text-xs font-mono font-bold text-emerald-800"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor={advanceAmountId} className="block text-[10px] tracking-wider uppercase font-bold text-charcoal/70 mb-1">
                Advance Deduction (₹)
              </label>
              <input
                id={advanceAmountId}
                type="number"
                value={advanceAmount}
                onChange={(e) => setAdvanceAmount(e.target.value)}
                placeholder="0"
                className="w-full bg-transparent border border-border focus:border-[color:var(--gold)] focus:outline-none px-3 py-2 text-xs font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor={amountWordsId} className="block text-[10px] tracking-wider uppercase font-bold text-charcoal/70 mb-1">
                Amount in Words
              </label>
              <input
                id={amountWordsId}
                type="text"
                value={amountInWords}
                onChange={(e) => setAmountInWords(e.target.value)}
                placeholder="Fourteen thousand rupees only..."
                className="w-full bg-transparent border border-border focus:border-[color:var(--gold)] focus:outline-none px-3 py-2 text-xs italic"
              />
            </div>

            <div>
              <label htmlFor={signedById} className="block text-[10px] tracking-wider uppercase font-bold text-charcoal/70 mb-1">
                Signed By
              </label>
              <input
                id={signedById}
                type="text"
                value={signedBy}
                onChange={(e) => setSignedBy(e.target.value)}
                placeholder="Authorized Signatory"
                className="w-full bg-transparent border border-border focus:border-[color:var(--gold)] focus:outline-none px-3 py-2 text-xs"
              />
            </div>

            <div>
              <label htmlFor={approvedById} className="block text-[10px] tracking-wider uppercase font-bold text-charcoal/70 mb-1">
                Approved By
              </label>
              <input
                id={approvedById}
                type="text"
                value={approvedBy}
                onChange={(e) => setApprovedBy(e.target.value)}
                placeholder="Sri Ganesh Gowda"
                className="w-full bg-transparent border border-border focus:border-[color:var(--gold)] focus:outline-none px-3 py-2 text-xs font-semibold text-[color:var(--forest)]"
              />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: PRINT-READY SALARY SLIP (Dark On-Screen, Crisp Pure Black & White on PDF) */}
        <div className="lg:col-span-7 flex justify-center w-full">
          <div
            id="printable-salary-slip"
            className="bg-[#262626] text-white p-8 md:p-12 rounded-none max-w-2xl w-full font-sans border border-neutral-700 shadow-2xl"
          >
            {/* SLIP TITLE */}
            <div className="text-center border-b-2 border-white pb-3 mb-3 print-bold">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white underline underline-offset-8 print-bold">
                Salary Slip For The Month of {monthYear || "July-2026"}
              </h2>
            </div>

            {/* COMPANY NAME */}
            <div className="text-center font-extrabold text-sm md:text-base tracking-widest uppercase text-neutral-100 mb-6 print-bold">
              <u>{companyName || "MA SHRI VENTURES PRIVATE LIMITED"}</u>
            </div>

            {/* EMPLOYEE ID SUBHEADER */}
            <div className="text-sm font-bold text-neutral-200 mb-4 px-1 print-bold">
              Employee ID: <span className="font-semibold text-white underline print-bold">{empId || "MSV-102"}</span>
            </div>

            {/* MAIN CONTENT BORDER BOX */}
            <div className="border border-neutral-300 p-6 md:p-8 space-y-6 text-sm md:text-base leading-relaxed text-neutral-100 bg-[#262626] print-slip-box">
              <div className="flex items-baseline gap-2">
                <span className="font-bold text-white min-w-[120px] print-bold">Name:</span>
                <span className="font-semibold text-neutral-100 text-base print-bold">{empName || "—"}</span>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="font-bold text-white min-w-[120px] print-bold">Designation:</span>
                <span className="font-medium text-neutral-200 print-bold">{designation || "—"}</span>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="font-bold text-white min-w-[120px] print-bold">Department:</span>
                <span className="font-medium text-neutral-200 print-bold">{department || "—"}</span>
              </div>

              <div className="pt-2 flex items-baseline gap-2">
                <span className="font-bold text-white min-w-[120px] print-bold">Basic Salary Rs:</span>
                <span className="font-semibold font-mono text-white text-base print-bold">
                  {basicSalary ? `₹${parseFloat(basicSalary).toLocaleString("en-IN")}` : "—"}
                </span>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="font-bold text-white min-w-[120px] print-bold">Net Salary Amount:</span>
                <span className="font-bold font-mono text-white text-lg print-bold">
                  {netSalary ? `₹${parseFloat(netSalary).toLocaleString("en-IN")}` : "—"}
                </span>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="font-bold text-white min-w-[120px] print-bold">Advance :</span>
                <span className="font-medium font-mono text-neutral-200 print-bold">
                  {advanceAmount ? `₹${parseFloat(advanceAmount).toLocaleString("en-IN")}` : "0"}
                </span>
              </div>

              <div className="pt-2 flex items-baseline gap-2 flex-wrap">
                <span className="font-bold text-white min-w-[160px] print-bold">Amount in the words:</span>
                <span className="font-semibold text-neutral-100 underline underline-offset-4 italic print-bold">
                  {amountInWords || "Fourteen thousand rupees only..."}
                </span>
              </div>

              {/* SIGNATURE SECTION */}
              <div className="pt-12 mt-6 flex justify-between items-end border-t border-neutral-600/60 print-slip-box">
                <div>
                  <span className="font-bold text-white block print-bold">Signed By:</span>
                  <span className="text-xs text-neutral-400 mt-1 block italic print-bold">{signedBy || "Authorized Signatory"}</span>
                </div>

                <div className="text-right">
                  <span className="font-bold text-white text-sm md:text-base print-bold">
                    Approved By : <span className="font-semibold text-neutral-100 print-bold">{approvedBy || "Sri Ganesh Gowda"}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SalarySlipPage() {
  return (
    <SiteShell>
      <div className="pt-28 pb-20 px-4 md:px-8 max-w-7xl mx-auto">
        <SalarySlipGenerator showBackLink={true} />
      </div>
    </SiteShell>
  );
}
