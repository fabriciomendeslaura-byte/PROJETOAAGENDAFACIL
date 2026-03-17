"use server";

export async function sendBookingNotification(data: any) {
  try {
    const response = await fetch('https://n8n.omniiabr.com/webhook-test/agendamento-confirmado', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    return { success: response.ok };
  } catch (error) {
    console.error("Erro ao enviar notificação n8n:", error);
    return { success: false, error: String(error) };
  }
}
