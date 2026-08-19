"use client";

import { Printer } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

/** Prints the current page. Hidden from the printout via the `print:hidden` class. */
export function PrintButton() {
  return (
    <Button variant="outline" size="sm" onClick={() => window.print()} className="print:hidden">
      <Printer size={16} /> Print / save PDF
    </Button>
  );
}
