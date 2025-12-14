"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { HelpCircle } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

export function HowToPlayModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="lg" className="gap-2 bg-transparent">
          <HelpCircle className="w-5 h-5" />
          Cách chơi
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <span className="text-3xl">🎲</span>
            Luật chơi Knuckle Bones (5×5)
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[70vh] pr-4">
          <div className="space-y-6 text-sm">
            <p className="text-muted-foreground">
              Knuckle Bones là một trò chơi xúc xắc chiến thuật giữa hai người chơi, diễn ra trên hai bảng
              5×5.
            </p>

            <section className="space-y-3">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <span>🎯</span>
                Mục tiêu
              </h3>
              <p>Điền đầy đủ 25 ô trên bảng của bạn trước đối thủ hoặc có tổng điểm cao nhất khi trò chơi kết thúc.</p>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <span>🔄</span>
                Lượt chơi cơ bản
              </h3>
              <ul className="space-y-2 list-disc list-inside ml-4">
                <li>
                  <strong>Tung Xúc xắc:</strong> Mỗi người chơi lần lượt tung một xúc xắc 6 mặt (D6).
                </li>
                <li>
                  <strong>Đặt Xúc xắc:</strong> Bạn phải đặt xúc xắc vừa tung vào bất kỳ ô trống nào trên bảng 5×5 của
                  mình. Xúc xắc luôn được xếp từ dưới lên trong một cột.
                </li>
              </ul>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <span>⚔️</span>
                Quy tắc Tấn công (Loại bỏ)
              </h3>
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 space-y-2">
                <p className="font-semibold">Đây là phần chiến thuật quan trọng nhất.</p>
                <p>
                  Khi bạn đặt một xúc xắc vào cột nào đó, nếu xúc xắc đó cùng giá trị với bất kỳ xúc xắc nào của đối thủ
                  trong cùng cột đối diện, thì tất cả xúc xắc cùng giá trị đó của đối thủ trong cột đó sẽ bị loại bỏ
                  (xóa khỏi bảng).
                </p>
                <div className="bg-background/50 rounded p-3 mt-2">
                  <p className="text-xs font-semibold mb-1">Ví dụ:</p>
                  <p className="text-xs">
                    Bạn đặt một mặt "5" vào Cột 2. Nếu AI có hai mặt "5" ở Cột 2, cả hai xúc xắc đó sẽ bị xóa.
                  </p>
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <span>💰</span>
                Quy tắc Tính điểm (Nhân điểm)
              </h3>
              <p>Điểm chỉ được tính từ các xúc xắc trên bảng của bạn.</p>
              <p>
                Các xúc xắc cùng giá trị nằm trong cùng một cột sẽ tạo ra hệ số nhân, giúp tăng điểm cực kỳ nhanh chóng.
              </p>
              <p className="font-mono text-xs bg-muted p-2 rounded">
                Công thức: (V × N) × N
                <br />V = Giá trị xúc xắc, N = Số lần lặp
              </p>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-xs">
                  <thead>
                    <tr className="border-b">
                      <th className="p-2 text-left">Số lần lặp (N)</th>
                      <th className="p-2 text-left">Hệ số nhân</th>
                      <th className="p-2 text-left">Ví dụ (mặt 4)</th>
                      <th className="p-2 text-left">Tính toán</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="p-2">1 (Đơn)</td>
                      <td className="p-2">Không nhân</td>
                      <td className="p-2 font-mono">4</td>
                      <td className="p-2 font-mono">4 × 1 = 4</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2">2 (Cặp)</td>
                      <td className="p-2">× 2</td>
                      <td className="p-2 font-mono">4, 4</td>
                      <td className="p-2 font-mono">(4 × 2) × 2 = 16</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2">3 (Bộ ba)</td>
                      <td className="p-2">× 3</td>
                      <td className="p-2 font-mono">4, 4, 4</td>
                      <td className="p-2 font-mono">(4 × 3) × 3 = 36</td>
                    </tr>
                    <tr>
                      <td className="p-2">5 (Bộ năm)</td>
                      <td className="p-2">× 5</td>
                      <td className="p-2 font-mono">4, 4, 4, 4, 4</td>
                      <td className="p-2 font-mono">(4 × 5) × 5 = 100</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <span>🏁</span>
                Kết thúc game
              </h3>
              <ul className="space-y-2 list-disc list-inside ml-4">
                <li>Trò chơi kết thúc ngay khi một người chơi điền đầy đủ 25 ô trên bảng của mình.</li>
                <li>Người chơi kia không có lượt cuối.</li>
                <li>Người chơi có tổng điểm cao hơn (tổng điểm của tất cả 5 cột) sẽ thắng.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <span>💡</span>
                Chiến thuật chính
              </h3>
              <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
                <p>
                  Mục tiêu của bạn là tối đa hóa các bộ ×3, ×4, ×5 trên bảng của mình, đồng thời sử dụng xúc xắc vừa
                  tung để xóa các bộ lớn của đối thủ.
                </p>
              </div>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
