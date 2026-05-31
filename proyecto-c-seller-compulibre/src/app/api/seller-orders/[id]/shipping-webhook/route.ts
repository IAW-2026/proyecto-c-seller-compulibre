import { isAuthorized } from "@/lib/api-auth";
import {
  handleShippingWebhook,
  parseShippingWebhookPayload,
  ShippingWebhookError,
} from "@/lib/shipping-webhook";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!isAuthorized(request, process.env.SHIPPING_API_KEY)) {
      return Response.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const payload = await request.json();
    const input = parseShippingWebhookPayload(payload);
    const result = await handleShippingWebhook(id, input);

    return Response.json(result);
  } catch (error) {
    if (error instanceof SyntaxError) {
      return Response.json({ error: "JSON invalido" }, { status: 400 });
    }

    if (error instanceof ShippingWebhookError) {
      return Response.json({ error: error.message }, { status: error.status });
    }

    console.error(error);
    return Response.json(
      { error: "Error al procesar el webhook de envio" },
      { status: 500 }
    );
  }
}
