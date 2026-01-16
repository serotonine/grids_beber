export async function fetchImages(){
  const base_url = "http://localhost/_DRUPAL/bertrand_segonzac/api/peinture";
  //const url = id ? `${base_url}/${id}/episodes` : base_url;
  const response = await fetch(base_url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} – Failed to fetch the shows.`);
  }
  return await response.json();
}
