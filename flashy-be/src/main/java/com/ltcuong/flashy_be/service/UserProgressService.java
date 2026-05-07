package com.ltcuong.flashy_be.service;

import com.ltcuong.flashy_be.dto.request.SRSReviewRequest;
import com.ltcuong.flashy_be.dto.response.SRSCardResponse;
import com.ltcuong.flashy_be.dto.response.SRSSetSummary;
import com.ltcuong.flashy_be.dto.response.SRSStatsResponse;

import java.util.List;

public interface UserProgressService {

    /** Lấy danh sách thẻ cần ôn hôm nay (hoặc chưa học) trong một set */
    List<SRSCardResponse> getDueCards(Long setId);

    /** Ghi nhận kết quả ôn tập một thẻ, tính toán lần ôn tiếp theo theo SM-2 */
    SRSCardResponse reviewCard(Long setId, SRSReviewRequest request);

    /** Thống kê tiến độ SRS của user trong một set */
    SRSStatsResponse getStats(Long setId);

    /** Tổng hợp SRS trên tất cả set của user (dùng cho dashboard widget) */
    List<SRSSetSummary> getOverview();
}
