package com.mywebapp.expensetracker.controller;

import com.mywebapp.expensetracker.entity.Transaction;
import com.mywebapp.expensetracker.entity.TransactionType;
import com.mywebapp.expensetracker.repository.TransactionRepository;
import com.mywebapp.expensetracker.service.TransactionService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@Controller
public class TransactionController {

    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @GetMapping("/")
    public String home(Model model) {

        model.addAttribute("transactions", transactionService.getAllTransactions());

        model.addAttribute("income", transactionService.getTotalIncome());
        model.addAttribute("expense", transactionService.getTotalExpense());
        model.addAttribute("balance", transactionService.getBalance());

        return "index";
    }

    @PostMapping("/add")
    public String addTransaction(
            @RequestParam String title,
            @RequestParam Double amount,
            @RequestParam String category,
            @RequestParam TransactionType type
    ) {

        Transaction transaction = new Transaction();
        transaction.setTitle(title);
        transaction.setAmount(amount);
        transaction.setCategory(category);
        transaction.setType(type);
        transaction.setDate(LocalDate.now());

        transactionService.addTransaction(transaction);

        return "redirect:/";
    }

    @GetMapping("/delete/{id}")
    public String deleteTransaction(@PathVariable Long id) {
        transactionService.deleteTransaction(id);
        return "redirect:/";
    }

    @GetMapping("/edit/{id}")
    public String editForm(@PathVariable Long id, Model model) {

        Transaction transaction = transactionService.getById(id);

        model.addAttribute("transaction", transaction);

        return "edit";
    }

    @PostMapping("/update")
    public String updateTransaction(@ModelAttribute Transaction transaction) {

        transactionService.updateTransaction(transaction);

        return "redirect:/";
    }


}