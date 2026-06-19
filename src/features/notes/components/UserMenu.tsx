"use client";
import { signOut, useSession } from "next-auth/react";
import { Avatar, Box, Typography, Divider } from "@mui/material";
import LogoutIcon from '@mui/icons-material/Logout';
import { DropDown } from "@/components/DropDown";

export const UserMenu = () => {
    const { data: session } = useSession();

    if (!session) return null;

    return (
        <DropDown direction="up"
            trigger={(onClick) => (
                <Box
                    onClick={onClick}
                    sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer', borderRadius: 2, p: 1.5, '&:hover': { bgcolor: 'action.hover' } }}
                >
                    <Avatar
                        src={session.user?.image ?? ''}
                        alt={session.user?.name ?? ''}
                        sx={{ width: 32, height: 32 }}
                    />
                    <Typography variant="body2" noWrap sx={{ flex: 1 }}>
                        {session.user?.name}
                    </Typography>
                </Box>
            )}
            header={
                <Box sx={{ px: 2, py: 1 }}>
                    <Typography variant="body2" fontWeight={500}>{session.user?.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{session.user?.email}</Typography>
                    <Divider sx={{ mt: 1 }} />
                </Box>
            }
            items={[
                {
                    label: 'Logout',
                    icon: <LogoutIcon fontSize="small" />,
                    onClick: () => signOut({ callbackUrl: "/login" }),
                },
            ]}
        />
    );
};