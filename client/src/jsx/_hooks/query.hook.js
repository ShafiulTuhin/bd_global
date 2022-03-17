import { useEffect, useState } from "react";

export default function useQuery() {
  const [query, setQuery] = useState({});
  useEffect(() => {
    setQuery(Object.fromEntries(new URLSearchParams(window.location.search)));
  }, [window.location.search]);
  return query;
}
