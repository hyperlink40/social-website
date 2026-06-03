export async function fetchSportsData(endpoint: 'sports' | 'event', eventId?: string, include?: string) {
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    const apiUrl = `${supabaseUrl}/functions/v1/fetch-sports`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${anonKey}`,
      },
      body: JSON.stringify({
        endpoint,
        eventId,
        include: include || 'scores',
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch sports data');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching sports data:', error);
    throw error;
  }
}

export async function fetchEventData(eventId: string, include = 'scores') {
  return fetchSportsData('event', eventId, include);
}

export async function fetchAllSports() {
  return fetchSportsData('sports');
}
