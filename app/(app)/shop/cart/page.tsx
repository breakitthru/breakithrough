import { requireOnboardedUser } from "@/lib/session";
import { getConfig } from "@/lib/config";
import { CartView } from "@/components/app/shop/cart-view";

export default async function CartPage() {
  await requireOnboardedUser();
  const config = await getConfig();
  return (
    <CartView
      shippingFeeInr={config.shippingFeeInr}
      freeShippingThresholdInr={config.freeShippingThresholdInr}
    />
  );
}
