import { isAuthorized } from "@/lib/api-auth";
import {
  confirmCatalogOrder,
  OrderConfirmationError,
  parseConfirmOrderPayload,
} from "@/lib/order-confirmation";

export async function POST(request: Request) {
  try {
    if (!isAuthorized(request, process.env.PAYMENTS_API_KEY)) {
      return Response.json({ error: "No autorizado" }, { status: 401 });
    }

    const payload = await request.json();
    const input = parseConfirmOrderPayload(payload);
    const result = await confirmCatalogOrder(input);

    return Response.json(
      {
        sellerOrderId: result.sellerOrderId,
        status: result.status,
        message: result.message,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof SyntaxError) {
      return Response.json({ error: "JSON invalido" }, { status: 400 });
    }

    if (error instanceof OrderConfirmationError) {
      return Response.json({ error: error.message }, { status: error.status });
    }

    console.error(error);
    return Response.json(
      { error: "Error al confirmar la orden" },
      { status: 500 }
    );
  }
}
