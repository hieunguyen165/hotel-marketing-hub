import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, AppRole } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Loader2, UserPlus, Trash2 } from "lucide-react";

interface Row {
  id: string;
  email: string | null;
  full_name: string | null;
  role: AppRole;
  created_at: string;
}

const roleLabel: Record<AppRole, string> = {
  admin: "Quản trị viên",
  manager: "Quản lý",
  member: "Thành viên",
};
const roleColor: Record<AppRole, string> = {
  admin: "bg-amber-500/15 text-amber-600 border-amber-500/30",
  manager: "bg-sky-500/15 text-sky-600 border-sky-500/30",
  member: "bg-muted text-muted-foreground border-border",
};

export default function Users() {
  const { user: me, refreshRole } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  // create form
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<AppRole>("member");
  const [creating, setCreating] = useState(false);

  const load = async () => {
    setLoading(true);
    const [{ data: profiles }, { data: roles }] = await Promise.all([
      supabase.from("profiles").select("id, email, full_name, created_at"),
      supabase.from("user_roles").select("user_id, role"),
    ]);
    const roleByUser = new Map<string, AppRole>();
    (roles ?? []).forEach((r: any) => {
      const cur = roleByUser.get(r.user_id);
      const order: Record<AppRole, number> = { admin: 3, manager: 2, member: 1 };
      if (!cur || order[r.role as AppRole] > order[cur]) {
        roleByUser.set(r.user_id, r.role);
      }
    });
    setRows(
      (profiles ?? []).map((p: any) => ({
        id: p.id,
        email: p.email,
        full_name: p.full_name,
        role: roleByUser.get(p.id) ?? "member",
        created_at: p.created_at,
      })),
    );
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const callAdmin = async (body: Record<string, unknown>) => {
    const { data, error } = await supabase.functions.invoke("admin-create-user", { body });
    if (error) throw new Error(error.message);
    if (data?.error) throw new Error(data.error);
    return data;
  };

  const handleCreate = async () => {
    if (!email || !password) {
      toast.error("Nhập email và mật khẩu");
      return;
    }
    setCreating(true);
    try {
      await callAdmin({ action: "create", email: email.trim(), password, full_name: fullName, role });
      toast.success("Đã tạo tài khoản");
      setOpen(false);
      setEmail(""); setPassword(""); setFullName(""); setRole("member");
      await load();
    } catch (e) {
      toast.error("Không tạo được", { description: (e as Error).message });
    } finally {
      setCreating(false);
    }
  };

  const handleSetRole = async (uid: string, newRole: AppRole) => {
    try {
      await callAdmin({ action: "set_role", user_id: uid, role: newRole });
      toast.success("Đã cập nhật vai trò");
      await load();
      if (uid === me?.id) await refreshRole();
    } catch (e) {
      toast.error("Lỗi", { description: (e as Error).message });
    }
  };

  const handleDelete = async (uid: string) => {
    try {
      await callAdmin({ action: "delete", user_id: uid });
      toast.success("Đã xóa người dùng");
      await load();
    } catch (e) {
      toast.error("Lỗi", { description: (e as Error).message });
    }
  };

  return (
    <AppLayout
      title="Quản lý người dùng"
      subtitle="Tạo tài khoản, gán vai trò cho thành viên trong doanh nghiệp"
      actions={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <UserPlus className="h-4 w-4" /> Thêm người dùng
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tạo tài khoản mới</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label>Họ tên</Label>
                <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Nguyễn Văn A" />
              </div>
              <div className="space-y-1.5">
                <Label>Email *</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="user@company.com" />
              </div>
              <div className="space-y-1.5">
                <Label>Mật khẩu *</Label>
                <Input type="text" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Tối thiểu 6 ký tự" />
              </div>
              <div className="space-y-1.5">
                <Label>Vai trò</Label>
                <Select value={role} onValueChange={(v) => setRole(v as AppRole)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Quản trị viên — Toàn quyền</SelectItem>
                    <SelectItem value="manager">Quản lý — Xem & quản lý</SelectItem>
                    <SelectItem value="member">Thành viên — Chỉ xem</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Hủy</Button>
              <Button onClick={handleCreate} disabled={creating}>
                {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Tạo tài khoản
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      }
    >
      <Card className="overflow-hidden">
        {loading ? (
          <div className="flex h-40 items-center justify-center text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang tải...
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Họ tên</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Vai trò</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">
                    {r.full_name || "—"}
                    {r.id === me?.id && (
                      <span className="ml-2 text-[10px] text-muted-foreground">(bạn)</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{r.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={roleColor[r.role]}>
                      {roleLabel[r.role]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(r.created_at).toLocaleDateString("vi-VN")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Select
                        value={r.role}
                        onValueChange={(v) => handleSetRole(r.id, v as AppRole)}
                      >
                        <SelectTrigger className="h-8 w-36 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Quản trị viên</SelectItem>
                          <SelectItem value="manager">Quản lý</SelectItem>
                          <SelectItem value="member">Thành viên</SelectItem>
                        </SelectContent>
                      </Select>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            disabled={r.id === me?.id}
                            title={r.id === me?.id ? "Không thể xóa chính bạn" : "Xóa"}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Xóa người dùng?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Hành động này sẽ xóa vĩnh viễn tài khoản <b>{r.email}</b> và không thể khôi phục.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Hủy</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(r.id)}>Xóa</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-8">
                    Chưa có người dùng nào
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </Card>
    </AppLayout>
  );
}