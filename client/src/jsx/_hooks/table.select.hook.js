import { useState, useEffect } from "react";

function useTableSelector(data = []) {
  const [selected, setSelected] = useState([]);
  const [isAllSelected, setIsAllSelected] = useState(false);

  function singleSelect(id) {
    // console.log(id)

    if (id) {
      let index = selected.findIndex((_s) => _s === id);
      index === -1
        ? setSelected([...selected, id])
        : setSelected(selected.filter((_s) => _s !== id));
    }
  }

  function bulkSelect(data) {
    let ids = data.map((record) => record.id);
    selected.length === data.length ? setSelected([]) : setSelected(ids);
  }

  useEffect(() => {
    selected.length
      ? setIsAllSelected(selected.length === data?.length)
      : setIsAllSelected(false);
  }, [selected, setIsAllSelected, data]);

  return {
    toggleSelect: singleSelect,
    bulkSelect,
    selected,
    checkedAll: isAllSelected,
    setSelected: setSelected
  };
}

export default useTableSelector;