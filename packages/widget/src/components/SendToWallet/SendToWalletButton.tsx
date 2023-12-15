import { Collapse } from '@mui/material';
import ErrorIcon from '@mui/icons-material/Error';
import WalletIcon from '@mui/icons-material/Wallet';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { isAddress } from 'viem';
import {
  useAccount,
  useAddressAndENSValidation,
  useRequiredToAddress,
} from '../../hooks';
import { useWidgetConfig } from '../../providers';
import {
  useFieldActions,
  useFieldValues,
  useSendToWalletStore,
  useSettings,
} from '../../stores';
import { AlertSection } from '../AlertSection';
import { DisabledUI, HiddenUI } from '../../types';
import { navigationRoutes, shortenAddress } from '../../utils';
import { Card, CardTitle } from '../Card';
import { SendToWalletCardHeader, WalletAvatarBase } from './SendToWallet.style';

const WalletAvatar = () => (
  <WalletAvatarBase>
    <WalletIcon sx={{ fontSize: 16 }} />
  </WalletAvatarBase>
);

export const SendToWalletButton = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { disabledUI, hiddenUI, toAddress } = useWidgetConfig();
  const { showSendToWallet, showSendToWalletDirty } = useSendToWalletStore();
  const { account } = useAccount();
  const { showDestinationWallet } = useSettings(['showDestinationWallet']);
  const [toAddressFieldValue] = useFieldValues('toAddress');
  const { getFieldValues } = useFieldActions();

  const disabledToAddress = disabledUI?.includes(DisabledUI.ToAddress);
  const hiddenToAddress = hiddenUI?.includes(HiddenUI.ToAddress);
  const requiredToAddress = useRequiredToAddress();
  const { validateAddressOrENS } = useAddressAndENSValidation();

  const [errorMessage, setErrorMessage] = useState('');

  const showInstantly =
    Boolean(
      !showSendToWalletDirty &&
        showDestinationWallet &&
        toAddress &&
        !hiddenToAddress,
    ) || requiredToAddress;

  const onClick = () => {
    if (!(toAddress && disabledToAddress)) {
      navigate(navigationRoutes.sendToWallet);
    }
  };

  useEffect(() => {
    const [toAddress] = getFieldValues('toAddress');
    if (toAddress) {
      validateAddressOrENS(toAddress).then((validationCheck) =>
        setErrorMessage(validationCheck.error),
      );
      // Trigger validation if we change requiredToAddress in the runtime
    } else if (requiredToAddress) {
      validateAddressOrENS(toAddress).then((validationCheck) =>
        setErrorMessage(validationCheck.error),
      );
    }
  }, [
    account.chainId,
    getFieldValues,
    setErrorMessage,
    toAddressFieldValue,
    requiredToAddress,
    validateAddressOrENS,
  ]);

  const title = toAddressFieldValue
    ? isAddress(toAddressFieldValue)
      ? shortenAddress(toAddressFieldValue)
      : toAddressFieldValue
    : t('main.selectAddress');

  return (
    <Collapse
      timeout={showInstantly ? 0 : 225}
      in={showSendToWallet || showInstantly}
      mountOnEnter
      unmountOnExit
    >
      <>
        <Card onClick={onClick} mx={3} mb={2}>
          <CardTitle>{t('header.sendToWallet')}</CardTitle>
          <SendToWalletCardHeader
            avatar={<WalletAvatar />}
            title={title}
            selected={
              !!toAddressFieldValue && !(toAddress && disabledToAddress)
            }
          />
        </Card>
        {!!errorMessage && (
          <AlertSection
            sx={{ marginX: '1.5rem', marginBottom: '1rem' }}
            severity="info"
            icon={<ErrorIcon />}
          >
            {errorMessage}
          </AlertSection>
        )}
      </>
    </Collapse>
  );
};
