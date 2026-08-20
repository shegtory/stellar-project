#![no_std]

use soroban_sdk::{
    contract, contractevent, contractimpl, contracttype, Address, Env, String, Vec,
};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct PaymentRecord {
    pub id: u64,
    pub sender: Address,
    pub destination: Address,
    pub amount: i128,
    pub memo: String,
    pub ledger: u32,
}

#[contracttype]
enum DataKey {
    Count,
    Payment(u64),
}

#[contractevent(topics = ["payment"], data_format = "vec")]
pub struct PaymentRecorded {
    #[topic]
    pub sender: Address,
    pub id: u64,
    pub destination: Address,
    pub amount: i128,
    pub memo: String,
}

#[contract]
pub struct PaymentTracker;

#[contractimpl]
impl PaymentTracker {
    /// Stores a verified payment record and emits a `payment` event.
    /// Amount is expressed in stroops (1 XLM = 10,000,000 stroops).
    pub fn record(
        env: Env,
        sender: Address,
        destination: Address,
        amount: i128,
        memo: String,
    ) -> u64 {
        sender.require_auth();
        assert!(amount > 0, "amount must be positive");
        assert!(memo.len() <= 64, "memo is too long");

        let id = env
            .storage()
            .instance()
            .get::<_, u64>(&DataKey::Count)
            .unwrap_or(0)
            + 1;

        let record = PaymentRecord {
            id,
            sender: sender.clone(),
            destination: destination.clone(),
            amount,
            memo: memo.clone(),
            ledger: env.ledger().sequence(),
        };

        env.storage().persistent().set(&DataKey::Payment(id), &record);
        env.storage().instance().set(&DataKey::Count, &id);
        env.storage().instance().extend_ttl(17_280, 120_960);
        env.storage()
            .persistent()
            .extend_ttl(&DataKey::Payment(id), 17_280, 120_960);

        PaymentRecorded {
            sender,
            id,
            destination,
            amount,
            memo,
        }
        .publish(&env);

        id
    }

    pub fn count(env: Env) -> u64 {
        env.storage()
            .instance()
            .get(&DataKey::Count)
            .unwrap_or(0)
    }

    pub fn get(env: Env, id: u64) -> Option<PaymentRecord> {
        env.storage().persistent().get(&DataKey::Payment(id))
    }

    pub fn recent(env: Env, limit: u32) -> Vec<PaymentRecord> {
        let count = Self::count(env.clone());
        let capped = limit.min(20) as u64;
        let first = count.saturating_sub(capped).saturating_add(1);
        let mut records = Vec::new(&env);

        if count == 0 {
            return records;
        }

        for id in first..=count {
            if let Some(record) = Self::get(env.clone(), id) {
                records.push_back(record);
            }
        }
        records
    }
}

#[cfg(test)]
mod test;
