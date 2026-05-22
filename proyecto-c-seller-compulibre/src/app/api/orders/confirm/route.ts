import {
  confirmCatalogOrder,
  OrderConfirmationError,
  parseConfirmOrderPayload,
} from "@/lib/order-confirmation";

function isAuthorized(request: Request) {
  const expectedApiKey = process.env.PAYMENTS_API_KEY;

  if (!expectedApiKey) {
    return process.env.NODE_ENV !== "production";
  }

  const apiKey = request.headers.get("x-api-key");
  const authorization = request.headers.get("authorization");

  return (
    apiKey === expectedApiKey || authorization === `Bearer ${expectedApiKey}`
  );
}

export async function POST(request: Request) {
  try {
    if (!isAuthorized(request)) {
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
