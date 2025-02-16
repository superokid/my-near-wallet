import { stringifyUrl } from 'query-string';

import { NearBlocksTxnsResponse } from './type';
import CONFIG from '../../config';
import sendJson from '../../tmp_fetch_send_json';
import { CUSTOM_REQUEST_HEADERS } from '../../utils/constants';

export default {
    listAccountsByPublicKey: (publicKey) => {
        return Promise.all([
            fetch(`${CONFIG.INDEXER_SERVICE_URL}/publicKey/${publicKey}/accounts`, {
                headers: {
                    ...CUSTOM_REQUEST_HEADERS,
                },
            })
                .then((res) => res.json())
                .catch((err) => {
                    console.warn('Error fetching accounts from kitwallet indexer', err);
                    return [];
                }),
            fetch(`${CONFIG.INDEXER_NEARBLOCKS_SERVICE_URL}/v1/keys/${publicKey}`, {
                headers: {
                    accept: '*/*',
                },
            })
                .then((res) => res.json())
                .then((res) => res.keys.map((key) => key.account_id))
                .catch((err) => {
                    console.warn('Error fetching accounts from nearblock', err);
                    return [];
                }),
        ]).then(([accounts, accountsFromNearblock]) => [
            ...new Set([...accounts, ...accountsFromNearblock]),
        ]);
    },
    listLikelyNfts: (accountId, timestamp) => {
        const url = `${CONFIG.INDEXER_SERVICE_URL}/account/${accountId}/likelyNFTsFromBlock`;
        return sendJson(
            'GET',
            stringifyUrl({
                url,
                query: {
                    fromBlockTimestamp: timestamp,
                },
            })
        );
    },
    listLikelyTokens: (accountId, timestamp) => {
        const url = `${CONFIG.INDEXER_SERVICE_URL}/account/${accountId}/likelyTokensFromBlock`;

        return sendJson(
            'GET',
            stringifyUrl({
                url,
                query: {
                    fromBlockTimestamp: timestamp,
                },
            })
        );
    },
    listRecentTransactions: (accountId) => {
        return fetch(`${CONFIG.INDEXER_SERVICE_URL}/account/${accountId}/activity`, {
            headers: {
                ...CUSTOM_REQUEST_HEADERS,
            },
        }).then((res) => res.json());
    },
    listTransactions: (
        accountId: string,
        page: number,
        perPage: number
    ): Promise<NearBlocksTxnsResponse> => {
        const url = `${CONFIG.INDEXER_NEARBLOCKS_SERVICE_URL}/v1/account/${accountId}/txns`;
        return sendJson(
            'GET',
            stringifyUrl({
                url,
                query: {
                    order: 'desc',
                    page,
                    per_page: perPage,
                },
            })
        );
    },
    listStakingDeposits: (accountId) => {
        return fetch(`${CONFIG.INDEXER_SERVICE_URL}/staking-deposits/${accountId}`, {
            headers: {
                ...CUSTOM_REQUEST_HEADERS,
            },
        }).then((r) => r.json());
    },
    listStakingPools: () => {
        return fetch(`${CONFIG.INDEXER_SERVICE_URL}/stakingPools`, {
            headers: {
                ...CUSTOM_REQUEST_HEADERS,
            },
        }).then((r) => r.json());
    },
};
