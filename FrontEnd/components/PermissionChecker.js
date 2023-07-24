import { useSelector } from 'react-redux'

export default function PermissionChecker({ permCode, children }) {
    const permList = useSelector((state) => state.permList);
    const havingPerm = permList.some(perm => perm.permObjCode == permCode);
    if (havingPerm) {
        return children
    } else {
        return null
    }
}