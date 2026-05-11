package com.mywebapp.expensetracker.service;

import com.mywebapp.expensetracker.entity.Transaction;
import com.mywebapp.expensetracker.repository.TransactionRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;

    public TransactionService(TransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    public List<Transaction> getAllTransactions() {
        return transactionRepository.findAll();
    }

    public void addTransaction(Transaction transaction) {
        transactionRepository.save(transaction);
    }

    public void deleteTransaction(Long id) {
        transactionRepository.deleteById(id);
    }

    public Transaction getById(Long id) {
        return transactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));
    }

    public void updateTransaction(Transaction updated) {

        Transaction existing = transactionRepository.findById(updated.getId())
                .orElseThrow(() -> new RuntimeException("Transaction not found"));

        existing.setTitle(updated.getTitle());
        existing.setAmount(updated.getAmount());
        existing.setCategory(updated.getCategory());

        // IMPORTANT: keep original date
        existing.setDate(existing.getDate());

        transactionRepository.save(existing);
    }
}