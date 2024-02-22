<template>
  <n-data-table
    :bordered="false"
    :columns="columns"
    :data="users"
    :pagination="{ pageSize: PaginationValues.PAGE_DEFAULT_LIMIT }"
  />
</template>

<script lang="ts" setup>
import type { DataTableColumns } from 'naive-ui';
import { NInput, NDatePicker } from 'naive-ui';
import { AirdropStatus, PaginationValues } from '~/lib/values/general.values';
import { validateEmail } from '~/lib/utils/validation';
import { dateTimeToDateAndTime } from '~/lib/utils/dates';

const props = defineProps({
  users: { type: Array<UserInterface>, required: true },
});
const emit = defineEmits(['addUser', 'removeUser']);
const message = useMessage();

const newUser = ref<UserInterface>({
  airdrop_status: AirdropStatus.PENDING,
  email: '',
  email_sent_time: null,
  email_start_send_time: null,
  wallet: null,
});

function isEditable(row: UserInterface, index: number) {
  return (
    !row.email &&
    (props.users.length === index + 1 ||
      props.users.length % PaginationValues.PAGE_DEFAULT_LIMIT === index + 1)
  );
}

const createColumns = (): DataTableColumns<UserInterface> => {
  return [
    {
      key: 'email',
      title: 'Email',
      render(row: UserInterface, index: number) {
        if (isEditable(row, index)) {
          return h(NInput, {
            value: newUser.value.email,
            type: 'email',
            onUpdateValue(v) {
              newUser.value.email = v;
            },
          });
        } else {
          return h('span', { class: 'whitespace-nowrap' }, row.email);
        }
      },
    },
    {
      key: 'wallet',
      title: 'Wallet',
      minWidth: 100,
      render(row: UserInterface) {
        return h(resolveComponent('TableEllipsis'), { text: row.wallet }, '');
      },
    },
    {
      key: 'tx_hash',
      title: 'Transaction hash',
      minWidth: 100,
      render(row: UserInterface) {
        return h(resolveComponent('TableEllipsis'), { text: row.tx_hash }, '');
      },
    },
    {
      key: 'airdrop_status',
      title: 'Status',
      minWidth: 100,
      render(row: UserInterface) {
        return AirdropStatus[row.airdrop_status].replaceAll('_', ' ');
      },
    },
    {
      key: 'email_sent_time',
      title: 'Email sent time',
      minWidth: 100,
      render(row: UserInterface) {
        return dateTimeToDateAndTime(row?.email_sent_time || '');
      },
    },
    {
      key: 'action_remove',
      title: '',
      render(row: UserInterface, index: number) {
        if (isEditable(row, index)) {
          return h(
            'button',
            { class: 'icon-check text-xl text-konference', onClick: () => addItem(row) },
            ''
          );
        } else if (!row.id) {
          return h(
            'button',
            { class: 'icon-delete text-xl text-black', onClick: () => removeItem(row) },
            ''
          );
        }
        return '';
      },
    },
  ];
};
const columns = createColumns();

function addItem(user: UserInterface) {
  if (!validateEmail(newUser.value.email)) {
    message.warning('Please enter a valid email address.');
    return;
  }

  user.email = newUser.value.email;
  newUser.value.email = '';

  emit('addUser', newUser.value);
}

function removeItem(user: UserInterface) {
  emit('removeUser', user.email);
}
</script>
