import { IoLocationSharp, IoSearchOutline } from "react-icons/io5";
import styles from "./SearchInputs.module.scss";
import { ChangeEvent, Dispatch, SetStateAction } from "react";

interface SearchInputsProps {
    valueName: string;
    valueLocation: string;
    setValueName: Dispatch<SetStateAction<string>>;
    setValueLocation: Dispatch<SetStateAction<string>>;
}

export default function SearchInputs({
    valueName,
    valueLocation,
    setValueName,
    setValueLocation,
}: SearchInputsProps) {
    const handleChangeName = (e: ChangeEvent<HTMLInputElement>) => {
        setValueName(e.target.value);
    };

    const handleChangeLocation = (e: ChangeEvent<HTMLInputElement>) => {
        setValueLocation(e.target.value);
    };

    return (
        <>
            <div className="relative">
                <IoSearchOutline className={styles["search__input-icon"]} />
                <input
                    className={styles["search__input"]}
                    type="text"
                    placeholder="Search by name..."
                    value={valueName}
                    onChange={handleChangeName}
                />
            </div>
            <div className="relative">
                <IoLocationSharp className={styles["search__input-icon"]} />
                <input
                    className={styles["search__input"]}
                    type="text"
                    placeholder="Search by location..."
                    value={valueLocation}
                    onChange={handleChangeLocation}
                />
            </div>
        </>
    );
}
