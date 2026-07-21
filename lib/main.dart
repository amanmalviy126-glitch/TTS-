import 'package:flutter/material.dart';

void main() {
  runApp(const VocalizeAiApp());
}

class VocalizeAiApp extends StatelessWidget {
  const VocalizeAiApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Vocalize AI',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF6366F1),
          brightness: Brightness.dark,
        ),
        useMaterial3: true,
      ),
      home: const Scaffold(
        body: Center(
          child: Text('Vocalize AI Android Flutter App Ready'),
        ),
      ),
    );
  }
}
