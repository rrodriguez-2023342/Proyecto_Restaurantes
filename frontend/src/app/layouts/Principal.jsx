import { PrincipalContainer } from "../../shared/layouts/PrincipalContainer"
import { Outlet } from "react-router-dom";

export const Principal = () => {
    return (
        <PrincipalContainer>
            <Outlet />
        </PrincipalContainer>
    )
}