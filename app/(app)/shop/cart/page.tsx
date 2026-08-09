import { requireOnboardedUser } from "@/lib/session";
import { CartView } from "@/components/app/shop/cart-view";

export default async function CartPage() {
  await requireOnboardedUser();
  return <CartView />;
}
