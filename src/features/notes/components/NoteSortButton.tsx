import SortOutlinedIcon from '@mui/icons-material/SortOutlined';
import { useNoteContext } from '../context/noteContext';
import { DropDown } from '@/components/DropDown';


export const NoteSortButton = () => {

    const { setSortBy } = useNoteContext();

    return (<>
        <DropDown direction="down" trigger={(onClick) => (
            <button onClick={onClick} className="btn-ghost px-1.5 py-1.5 rounded-full">
                <SortOutlinedIcon fontSize="small" />
            </button>
        )}
            items={[
                { label: 'Sort by name', onClick: () => setSortBy('name') },
                { label: 'Sort by edit time', onClick: () => setSortBy('date') },
            ]}

            menuItemClassName="text-sm"

        />
    </>);
};


