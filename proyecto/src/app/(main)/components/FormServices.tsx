"use client";
import { useForm } from "react-hook-form";
import { ArrowRight, Sparkles } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { serviceApi, Service } from "@/lib/api/service";
import { contactApi } from "@/lib/api/contact";
import { toast } from "sonner";

type FormValues = {
  id_service: number;
  name: string;
  email: string;
  message: string;
};

export function FormServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [recaptchaValue, setRecaptchaValue] = useState<string | null>(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>();

  useEffect(() => {
    const loadServices = async () => {
      try {
        const servicesData = await serviceApi.service.getAll();
        setServices(servicesData.filter((s) => s.deleted_at === null));
      } catch (error) {
        console.error(error);
        toast.error("Error al cargar los servicios");
      } finally {
        setIsLoading(false);
      }
    };
    loadServices();
  }, []);

  const onSubmit = async (data: FormValues) => {
    // Validar ReCAPTCHA
    if (!recaptchaValue) {
      setFormError("Por favor, complete la verificación ReCAPTCHA.");
      return;
    }

    setIsSubmitting(true);
    setFormError(null);
    try {
      await contactApi.contact.create(data);
      toast.success("¡Solicitud enviada correctamente!");
      reset();
      // Resetear ReCAPTCHA
      recaptchaRef.current?.reset();
      setRecaptchaValue(null);
    } catch (error) {
      console.error(error);
      setFormError("Error al enviar la solicitud. Intente nuevamente.");
      // Resetear ReCAPTCHA en caso de error
      recaptchaRef.current?.reset();
      setRecaptchaValue(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onRecaptchaChange = (value: string | null) => {
    setRecaptchaValue(value);
    // Limpiar errores cuando se complete el ReCAPTCHA
    if (value) {
      setFormError(null);
    }
  };

  return (
    <section className="h-full">
      <div className="bg-white/40 border border-white/30 backdrop-blur-md p-6 sm:p-8 rounded-[2rem] shadow-md transition-all duration-200 hover:shadow-lg h-full">
        <div className="relative">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-teal-600/10 rounded-xl">
              <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-teal-600" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800">
              Solicitar Asesoramiento Personalizado
            </h2>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5"
            aria-busy={isSubmitting}
          >
            {/* Servicio */}
            <div>
              <label
                htmlFor="id_service"
                className="block font-semibold text-slate-700 mb-2"
              >
                Seleccione el servicio que necesita
              </label>
              <select
                id="id_service"
                {...register("id_service", {
                  required: true,
                  valueAsNumber: true,
                })}
                disabled={isLoading}
                className="w-full p-3 bg-white/50 backdrop-blur-sm border border-teal-600/20 rounded-xl focus:ring-2 focus:ring-teal-600 text-base disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="" disabled>
                  {isLoading
                    ? "Cargando servicios..."
                    : "Seleccione una opción"}
                </option>
                {services.map((service) => (
                  <option key={service.id_service} value={service.id_service}>
                    {service.service_name}
                  </option>
                ))}
              </select>
              {errors.id_service && (
                <p className="text-sm text-red-600 mt-1">
                  Este campo es requerido
                </p>
              )}
            </div>

            {/* Nombre */}
            <div>
              <label
                htmlFor="name"
                className="block font-semibold text-slate-700 mb-2"
              >
                Nombre completo
              </label>
              <input
                id="name"
                type="text"
                {...register("name", { required: true })}
                placeholder="Ingrese su nombre completo"
                className="w-full p-3 bg-white/50 backdrop-blur-sm border border-teal-600/20 rounded-xl focus:ring-2 focus:ring-teal-600 text-base"
              />
              {errors.name && (
                <p className="text-sm text-red-600 mt-1">
                  Este campo es requerido
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block font-semibold text-slate-700 mb-2"
              >
                Correo electrónico de contacto
              </label>
              <input
                id="email"
                type="email"
                {...register("email", {
                  required: true,
                  pattern: /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/,
                })}
                placeholder="ejemplo@correo.com"
                className="w-full p-3 bg-white/50 backdrop-blur-sm border border-teal-600/20 rounded-xl focus:ring-2 focus:ring-teal-600 text-base"
              />
              {errors.email && (
                <p className="text-sm text-red-600 mt-1">
                  Ingrese un correo electrónico válido
                </p>
              )}
            </div>

            {/* Mensaje */}
            <div>
              <label
                htmlFor="message"
                className="block font-semibold text-slate-700 mb-2"
              >
                Mensaje detallado
              </label>
              <textarea
                id="message"
                rows={4}
                {...register("message", { required: true })}
                placeholder="Cuéntenos sobre su proyecto y necesidades específicas..."
                className="w-full p-3 bg-white/50 backdrop-blur-sm border border-teal-600/20 rounded-xl focus:ring-2 focus:ring-teal-600 text-base resize-none"
              />
              {errors.message && (
                <p className="text-sm text-red-600 mt-1">
                  Este campo es requerido
                </p>
              )}
            </div>

            {/* ReCAPTCHA */}
            <div className="flex justify-center ">
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ""}
                onChange={onRecaptchaChange}
                theme="light"
                size="normal"
              />
            </div>

            {/* Error general */}
            {formError && (
              <p className="text-red-600 text-center">{formError}</p>
            )}

            {/* Botón */}
            <button
              type="submit"
              disabled={isSubmitting || isLoading || !recaptchaValue}
              className="w-full bg-teal-600 text-white py-3 px-6 rounded-xl hover:bg-teal-700 transition-all duration-300 transform hover:scale-[1.02] font-medium text-base shadow-md hover:shadow-lg flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 cursor-pointer"
            >
              <span>
                {isSubmitting
                  ? "Enviando solicitud..."
                  : "Enviar solicitud de asesoramiento"}
              </span>
              {!isSubmitting && (
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              )}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
