import { ChainType } from '@lifi/sdk';
import { getWalletIcon, isWalletInstalledAsync } from '@lifi/wallet-management';
import { Avatar, ListItemAvatar } from '@mui/material';
import type { Connector } from 'wagmi';
import { useConnect, useDisconnect } from 'wagmi';
import { ListItemButton } from '../../components/ListItemButton';
import { ListItemText } from '../../components/ListItemText';
import { useNavigateBack, useWidgetEvents } from '../../hooks';
import { WidgetEvent } from '../../types';

interface EVMListItemButtonProps {
  connectedConnector?: Connector;
  connector: Connector;
  onNotInstalled(connector: Connector): void;
}

export const EVMListItemButton = ({
  connectedConnector,
  connector,
  onNotInstalled,
}: EVMListItemButtonProps) => {
  const { navigateBack } = useNavigateBack();
  const emitter = useWidgetEvents();
  const { connectAsync } = useConnect();
  const { disconnectAsync } = useDisconnect();

  const handleEVMConnect = async () => {
    const identityCheckPassed = await isWalletInstalledAsync(connector.id);
    if (!identityCheckPassed) {
      onNotInstalled(connector);
      return;
    }
    if (connectedConnector) {
      await disconnectAsync({ connector: connectedConnector });
    }
    await connectAsync(
      { connector },
      {
        onSuccess(data) {
          emitter.emit(WidgetEvent.WalletConnected, {
            address: data.accounts[0],
            chainId: data.chainId,
            chainType: ChainType.EVM,
          });
        },
      },
    );
    navigateBack();
  };

  return (
    <ListItemButton key={connector.uid} onClick={handleEVMConnect}>
      <ListItemAvatar>
        <Avatar
          src={connector.icon || getWalletIcon(connector.id)}
          alt={connector.name}
        >
          {connector.name[0]}
        </Avatar>
      </ListItemAvatar>
      <ListItemText primary={connector.name} />
    </ListItemButton>
  );
};
