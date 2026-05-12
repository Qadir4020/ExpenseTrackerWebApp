package com.mywebapp.expensetracker.service;

import com.mywebapp.expensetracker.entity.Transaction;
import com.mywebapp.expensetracker.entity.TransactionType;
import com.mywebapp.expensetracker.repository.TransactionRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;

    public TransactionService(TransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    // GET ALL
    public List<Transaction> getAllTransactions() {
        return transactionRepository.findAll();
    }

    // CREATE
    public Transaction addTransaction(Transaction transaction) {
        return transactionRepository.save(transaction);
    }

    // DELETE
    public void deleteTransaction(Long id) {

        if (!transactionRepository.existsById(id)) {
            throw new RuntimeException("Transaction not found");
        }

        transactionRepository.deleteById(id);
    }

    // GET ONE
    public Transaction getById(Long id) {
        return transactionRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Transaction not found"));
    }

    // UPDATE
    public Transaction updateTransaction(Transaction updated) {

        Transaction existing = transactionRepository.findById(updated.getId())
                .orElseThrow(() ->
                        new RuntimeException("Transaction not found"));

        existing.setTitle(updated.getTitle());
        existing.setAmount(updated.getAmount());
        existing.setCategory(updated.getCategory());
        existing.setType(updated.getType());

        // keep original date
        existing.setDate(existing.getDate());

        return transactionRepository.save(existing);
    }

    // TOTAL INCOME
    public double getTotalIncome() {

        return transactionRepository.findAll()
                .stream()
                .filter(t -> t.getType() == TransactionType.INCOME)
                .mapToDouble(Transaction::getAmount)
                .sum();
    }

    // TOTAL EXPENSE
    public double getTotalExpense() {

        return transactionRepository.findAll()
                .stream()
                .filter(t -> t.getType() == TransactionType.EXPENSE)
                .mapToDouble(Transaction::getAmount)
                .sum();
    }

    // BALANCE
    public double getBalance() {
        return getTotalIncome() - getTotalExpense();
    }
}