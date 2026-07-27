import { getPublishedListings } from "@/lib/discover/listings";
import { MatchesView } from "@/components/discover/MatchesView";

export default async function MatchesPage({
  searchParams,
}: {
  searchParams: Promise<{ ids?: string }>;
}) {
  const { ids } = await searchParams;
  const idList = ids ? ids.split(",").filter(Boolean) : [];
  const listings = await getPublishedListings();
  const matches = listings.filter((listing) => idList.includes(listing.id));

  return <MatchesView listings={matches} />;
}
