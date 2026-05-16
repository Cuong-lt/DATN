package com.ltcuong.flashy_be.service.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ltcuong.flashy_be.dto.request.AiGenerateRequest;
import com.ltcuong.flashy_be.dto.response.GeneratedFlashcardItem;
import com.ltcuong.flashy_be.exception.AppException;
import com.ltcuong.flashy_be.exception.ErrorCode;
import com.ltcuong.flashy_be.service.AiFlashcardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiFlashcardServiceImpl implements AiFlashcardService {

    private static final String GEMINI_URL =
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=";

    @Value("${gemini.api.key}")
    private String apiKey;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Override
    public List<GeneratedFlashcardItem> generateFlashcards(AiGenerateRequest request) {
        String prompt = buildPrompt(request.getText(), request.getCardCount());

        Map<String, Object> body = Map.of(
                "contents", List.of(Map.of(
                        "parts", List.of(Map.of("text", prompt))
                ))
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(
                    GEMINI_URL + apiKey, entity, String.class
            );

            String responseBody = response.getBody();
            if (responseBody == null) {
                throw new AppException(ErrorCode.AI_GENERATION_FAILED);
            }

            JsonNode root = objectMapper.readTree(responseBody);
            String text = root.path("candidates")
                    .path(0)
                    .path("content")
                    .path("parts")
                    .path(0)
                    .path("text")
                    .asText();


            text = text.trim();
            if (text.startsWith("```")) {
                text = text.replaceAll("^```[a-zA-Z]*\\n?", "").replaceAll("```$", "").trim();
            }

            List<GeneratedFlashcardItem> items = objectMapper.readValue(
                    text, new TypeReference<List<GeneratedFlashcardItem>>() {}
            );

            return items.stream()
                    .filter(i -> i.getTerm() != null && !i.getTerm().isBlank()
                            && i.getDefinition() != null && !i.getDefinition().isBlank())
                    .toList();

        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            log.error("Gemini API error: {}", e.getMessage());
            throw new AppException(ErrorCode.AI_GENERATION_FAILED);
        }
    }

    private String buildPrompt(String text, int cardCount) {
        return String.format(
                "Generate exactly %d flashcards from the following content. " +
                "Return ONLY a valid JSON array with no extra text. " +
                "Each element must have exactly two fields: \"term\" and \"definition\". " +
                "The term should be a concise concept or keyword. " +
                "The definition should be a clear, helpful explanation.\n\n%s",
                cardCount, text
        );
    }
}
