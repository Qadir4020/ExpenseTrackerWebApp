package com.mywebapp.expensetracker.controller;

import com.mywebapp.expensetracker.entity.Transaction;
import com.mywebapp.expensetracker.entity.TransactionType;
import com.mywebapp.expensetracker.service.TransactionService;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    // GET ALL TRANSACTIONS + SUMMARY
    @GetMapping
    public Map<String, Object> home() {

        Map<String, Object> response = new HashMap<>();

        response.put("transactions",
                transactionService.getAllTransactions());

        response.put("income",
                transactionService.getTotalIncome());

        response.put("expense",
                transactionService.getTotalExpense());

        response.put("balance",
                transactionService.getBalance());

        return response;
    }

    // ADD TRANSACTION
    @PostMapping
    public Transaction addTransaction(
            @RequestBody Transaction transaction
    ) {

        transaction.setDate(LocalDate.now());

        return transactionService.addTransaction(transaction);
    }

    // DELETE TRANSACTION
    @DeleteMapping("/{id}")
    public String deleteTransaction(@PathVariable Long id) {

        transactionService.deleteTransaction(id);

        return "Transaction deleted successfully";
    }

    // GET SINGLE TRANSACTION
    @GetMapping("/{id}")
    public Transaction getTransaction(@PathVariable Long id) {

        return transactionService.getById(id);
    }

    // UPDATE TRANSACTION
    @PutMapping("/{id}")
    public Transaction updateTransaction(
            @PathVariable Long id,
            @RequestBody Transaction updatedTransaction
    ) {

        updatedTransaction.setId(id);

        return transactionService.updateTransaction(updatedTransaction);
    }
}