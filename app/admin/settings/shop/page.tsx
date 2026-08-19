import { requirePermission } from "@/lib/admin";
import { getConfig } from "@/lib/config";
import { setSettingsConfig } from "@/lib/admin-settings-actions";
import { PageHeader, Section } from "@/components/admin/ui";
import { SettingsTabs } from "@/components/admin/settings/settings-tabs";
import { ConfigEditor } from "@/components/admin/config-editor";

export default async function ShopSettingsPage() {
  await requirePermission("settings.edit");
  const config = await getConfig();

  return (
    <>
      <PageHeader eyebrow="Settings" title="Shop & delivery" subtitle="Delivery charges and the tax details printed on order invoices." />
      <SettingsTabs />

      <Section title="Delivery charges">
        <ConfigEditor
          action={setSettingsConfig}
          fields={[
            { key: "shippingFeeInr", label: "Delivery fee (₹)", value: config.shippingFeeInr, hint: "Flat fee added at checkout. 0 = free shipping." },
            { key: "freeShippingThresholdInr", label: "Free shipping over (₹)", value: config.freeShippingThresholdInr, hint: "Waive the fee when the cart subtotal is at or above this. 0 = no free-shipping threshold." },
          ]}
        />
      </Section>

      <Section title="Tax invoice (GST)">
        <ConfigEditor
          action={setSettingsConfig}
          fields={[
            { key: "gstRatePct", label: "GST rate (%)", value: config.gstRatePct, hint: "Prices are treated as GST-inclusive. Set 0 to hide GST on invoices; e.g. 5, 12, 18." },
            { key: "gstin", label: "GSTIN", value: config.gstin, kind: "text", hint: "Your 15-character GST number. Leave blank if not GST-registered." },
            { key: "businessName", label: "Seller name (on invoice)", value: config.businessName, kind: "text" },
            { key: "businessAddress", label: "Seller address (on invoice)", value: config.businessAddress, kind: "text", hint: "Shown in the invoice header." },
          ]}
        />
      </Section>
    </>
  );
}
