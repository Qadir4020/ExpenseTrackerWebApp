package com.mywebapp.expensetracker.controller;

import com.mywebapp.expensetracker.entity.Transaction;
import com.mywebapp.expensetracker.repository.TransactionRepository;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@Controller
public class TransactionController {

    private final TransactionRepository transactionRepository;

    public TransactionController(TransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    @GetMapping("/")
    public String home(Model model) {

        model.addAttribute("transactions",
                transactionRepository.findAll());

        return "index";
    }

    @PostMapping("/add")
    public String addTransaction(
            @RequestParam String title,
            @RequestParam Double amount,
            @RequestParam String category
    ) {

        Transaction transaction = new Transaction();

        transaction.setTitle(title);
        transaction.setAmount(amount);
        transaction.setCategory(category);
        transaction.setDate(LocalDate.now());

        transactionRepository.save(transaction);

        return "redirect:/";
    }
}